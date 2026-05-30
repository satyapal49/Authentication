import express from 'express';
import { loginUser, registerUser, verifyOtp, verifyUser } from '../controllers/user.js';

// Router groups authentication related routes under a single module.
const router = express.Router();

// Register a new user (creates a verification email)
router.post("/register", registerUser);
// Verify email using token that was emailed to the user
router.post("/verify/:token", verifyUser);

// Start login process (sends OTP to email)
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp)

export default router;