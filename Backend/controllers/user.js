// Controller functions for user authentication flows.
// Each exported function is wrapped with `TryCatch` middleware to handle errors
// and return a 500 response if something unexpected happens.

import { email, ZodError } from 'zod';
import { loginSchema, registerSchema } from '../config/zod.js';
import TryCatch from '../middlewares/tryCatch.js';
import sanitize from 'mongo-sanitize';
import { redisClient } from '../index.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import SendmailTransport from 'nodemailer/lib/sendmail-transport/index.js';
import sendMail from '../config/sendMail.js';
import { getOtpHtml, getVerifyEmailHtml } from '../config/html.js';
import { generateAccessToken, generateToken, verifyRefreshToken, revokeRefreshToken } from '../config/generateToken.js';

// registerUser: Handles new user registrations.
// Steps:
// 1. Sanitize and validate input using Zod
// 2. Rate-limit registration attempts per IP+email using Redis
// 3. Check if user already exists in MongoDB
// 4. Hash password and store user data temporarily in Redis with a verification token
// 5. Send verification email containing a link with the token
export const registerUser = TryCatch(async (req, res) => {
    // Remove any keys that look like MongoDB operators to avoid injection
    const sanitizeBody = sanitize(req.body);

    // Validate request body against our register schema
    const validation = registerSchema.safeParse(sanitizeBody);

    // If validation failed, convert Zod issues into a friendly response
    if (!validation.success) {
        let zoderror = validation.error;
        let firstErrorMessage = "Validation error";
        let allError = [];

        if (zoderror?.issues && Array.isArray(zoderror.issues)) {
            allError = zoderror.issues.map((issue) => ({
                field: issue.path ? issue.path.join(".") : "unknown",
                message: issue.message || "Validation Error",
                code: issue.code,
            }));

            firstErrorMessage = allError[0]?.message || "Validation Error";

        }

        return res.status(400).json({
            message: firstErrorMessage,
            error: allError,
        });
    }

    // Extract validated data
    const { name, email, password } = validation.data;

    // Simple rate limiting key to protect from rapid repeated attempts
    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
    if (await redisClient.get(rateLimitKey)) {
        return res.status(429).json({
            message: 'too many request, try again later',
        })
    }

    // Check the database to see if the user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(400).json({
            message: 'User already exists',
        });
    }

    // Hash the password before storing it anywhere
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a verification token and store user info in Redis temporarily
    // The token is sent to the user's email so they can verify ownership.
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyKey = `verify:${verifyToken}`;

    const dataStore = JSON.stringify({
        name,
        email,
        password: hashPassword,
    });

    // Store the serialized user data with a short TTL (5 minutes)
    await redisClient.set(verifyKey, dataStore, { EX: 300 });

    // Prepare and send verification email
    const subject = 'verify your email for account creation';
    const html = getVerifyEmailHtml({ email, token: verifyToken });
    await sendMail({ email, subject, html });

    // Set a short rate-limit flag so the client can't spam register requests
    await redisClient.set(rateLimitKey, 'true', { EX: 60 });

    res.json({
        message: "if your email is valid, a verification link has been sent. it will expire in 5 mins"
    });
})

// verifyUser: Called when user clicks the verification link in email.
// Steps:
// 1. Read token from URL params
// 2. Fetch stored user data from Redis using token
// 3. Create the user in MongoDB and respond
export const verifyUser = TryCatch(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({
            message: 'Verification token is required.'
        })
    }

    const verifyKey = `verify:${token}`
    const userDataJson = await redisClient.get(verifyKey);

    if (!userDataJson) {
        return res.status(400).json({
            message: 'Verification link is expired'
        })
    }

    // Delete the temporary Redis entry now that it's being used
    await redisClient.del(verifyKey);

    const UserData = JSON.parse(userDataJson);

    // If a user with this email was created in the meantime, prevent duplicate
    const existingUser = await User.findOne({ email: UserData.email });

    if (existingUser) {
        return res.status(400).json({
            message: 'User already exists.'
        });
    }

    // Create the new user record in MongoDB
    const newUser = await User.create({
        name: UserData.name,
        email: UserData.email,
        password: UserData.password
    })

    res.status(201).json({
        message: 'Email Verified Successfully! Your Account has been created',
        user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email
        }
    });
});

// loginUser: Step 1 of login. Verifies credentials and issues a one-time OTP.
// Steps:
// 1. Validate input
// 2. Check rate-limit
// 3. Verify credentials against DB
// 4. Generate OTP, store in Redis, and email it to the user
export const loginUser = TryCatch(async (req, res) => {
    const sanitizeBody = sanitize(req.body);
    const validation = loginSchema.safeParse(sanitizeBody);

    if (!validation.success) {
        let zoderror = validation.error;
        let firstErrorMessage = "Validation error";
        let allError = [];

        if (zoderror?.issues && Array.isArray(zoderror.issues)) {
            allError = zoderror.issues.map((issue) => ({
                field: issue.path ? issue.path.join(".") : "unknown",
                message: issue.message || "Validation Error",
                code: issue.code,
            }));

            firstErrorMessage = allError[0]?.message || "Validation Error";

        };

        return res.status(400).json({
            message: firstErrorMessage,
            error: allError,
        });
    }

    const { email, password } = validation.data;

    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`
    if (await redisClient.get(rateLimitKey)) {
        return res.status(429).json({
            message: 'too many request, try again later',
        });
    };

    // Find user in DB
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({
            message: 'User not Exists or Invalid credentials'
        });
    };

    // Compare provided password with hashed password stored in DB
    const comparePassword = await bcrypt.compare(password, user.password);
    if(!comparePassword){
        return res.status(400).json({
            message: 'User not Exists or Invalid credentials'
        });
    };

    // Generate a 6-digit OTP and store it in Redis for 5 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;

    await  redisClient.set(otpKey, JSON.stringify(otp), { EX : 300, });

    const subject = 'OTP for Verification';
    const html = getOtpHtml({email, otp});
    await sendMail({email, subject, html});

    // Apply a short rate-limit so the user cannot request OTPs too often
    await redisClient.set(rateLimitKey, "true", { EX : 60 });

    res.json({
        message: 'if your email is valid, an otp has been sent. it will be valid for 5 mins'
    });
});

// resendOtp: Sends a fresh OTP after the 60-second login/resend cooldown.
export const resendOtp = TryCatch(async (req, res) => {
    const sanitizeBody = sanitize(req.body);
    const { email } = sanitizeBody;

    if (!email) {
        return res.status(400).json({
            message: 'please provide email'
        });
    };

    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;
    if (await redisClient.get(rateLimitKey)) {
        return res.status(429).json({
            message: 'please wait 1 minute before requesting another otp',
        });
    };

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: 'User not Exists or Invalid credentials'
        });
    };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;

    await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 });

    const subject = 'OTP for Verification';
    const html = getOtpHtml({ email, otp });
    await sendMail({ email, subject, html });

    await redisClient.set(rateLimitKey, "true", { EX: 60 });

    res.json({
        message: 'a new otp has been sent. it will be valid for 5 mins'
    });
});

// verifyOtp: Step 2 of login. Client posts email+otp to complete authentication.
export const verifyOtp = TryCatch(async(req,res)=>{
    const {email, otp} = req.body;
    if(!email || !otp){
        return res.status(400).json({
            message: 'please provide all details'
        });
    };

    const otpKey = `otp:${email}`;
    const storedOtpString = await redisClient.get(otpKey);
    if(!storedOtpString){
        return res.status(400).json({
            message: 'OTP is expired',
        });
    };
    const storedOtp = JSON.parse(storedOtpString);

    if(storedOtp !== otp){
        return res.status(400).json({
            message: "Invalid Otp"
        });
    };
    // Once verified, remove the OTP so it cannot be reused
    await redisClient.del(otpKey);

    let user = await User.findOne({email});

    const tokenData = await generateToken(user._id, res);

    res.status(200).json({
        message: `Welcome to ${user.name}`,
        user
    });
    
});

// myProfile: Returns the authenticated user's profile.
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user
    res.json(user);
});

// refreshToken: Issues a new access token if the provided refresh token is valid.
export const refreshToken = TryCatch(async(req, res)=>{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({
            message: "Invalid refresh token"
        });
    }
    const decode = await verifyRefreshToken(refreshToken)
    if(!decode){
        return res.status(401).json({
            message: "Invalid Refresh token",
        });
    }
    generateAccessToken(decode.id, res);

    res.status(200).json({
        message: "token refreshed"
    });
}); 

// logoutUser: Logs out the authenticated user by revoking their refresh token and clearing cookies.
export const logoutUser = TryCatch(async(req, res) => {
    const userId = req.user._id;
    console.log("logout user id", userId);
    await revokeRefreshToken(userId);

    // Clear the authentication cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("csrfToken");

    await redisClient.del(`user:${userId}`);

    res.json({
        message: "Logged out successfully"
    });
});


export const refreshCSRFToken = TryCatch(async(req, res) => {
    const userId = req.user._id;
    const csrfToken = await generateCSRFToken(userId, res);

    res.status(200).json({
        message: "CSRF token refreshed successfully",
        csrfToken: newCsrfToken,
    });
});