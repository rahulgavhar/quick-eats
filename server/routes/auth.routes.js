import express from 'express';
const authRouter = express.Router();

import { signUp, signIn, signOut, sendOTP, resendOTP, verifyOTP, resetPassword, googleAuth } from '../controllers/auth.controllers.js';
import { authRateLimiter, passwordResetRateLimiter } from '../middlewares/rateLimiter.js';

authRouter.post('/signup', authRateLimiter, signUp);
authRouter.post('/signin', authRateLimiter, signIn);
authRouter.post('/google-auth', authRateLimiter, googleAuth);
authRouter.post('/signout', signOut);


authRouter.post('/reset-password/send-otp', passwordResetRateLimiter, sendOTP);
authRouter.post('/reset-password/resend-otp', passwordResetRateLimiter, resendOTP);
authRouter.post('/reset-password/verify-otp', verifyOTP);
authRouter.post('/reset-password/reset', resetPassword);

export default authRouter;