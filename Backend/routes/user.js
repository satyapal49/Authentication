import express from 'express';
import { loginUser, myProfile, registerUser, verifyOtp, verifyUser } from '../controllers/user.js';
import { isAuth } from '../middlewares/isAuth.js'

// Router groups authentication related routes under a single module.
const router = express.Router();

// Register a new user (creates a verification email)
router.post("/register", registerUser);
// Verify email using token that was emailed to the user
router.post("/verify/:token", verifyUser);

// Start login process (sends OTP to email)
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp)
router.get("/me", isAuth, myProfile)

export default router;