import express from 'express';
import { loginUser, myProfile, refreshToken, registerUser, verifyOtp, verifyUser, logoutUser, resendOtp } from '../controllers/user.js';
import { isAuth } from '../middlewares/isAuth.js'

// Router groups authentication related routes under a single module.
const router = express.Router();

// Register a new user (creates a verification email)
router.post("/register", registerUser);
// Verify email using token that was emailed to the user
router.post("/verify/:token", verifyUser);

// Start login process (sends OTP to email)
router.post("/login", loginUser);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", isAuth, myProfile);
router.post("/refresh", refreshToken);
router.post("/logout", isAuth, logoutUser);

export default router;
