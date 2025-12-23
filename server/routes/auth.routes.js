import express from 'express';
const authRouter = express.Router();

import { signUp, signIn, signOut, sendOTP, resendOTP, verifyOTP, resetPassword, googleAuth } from '../controllers/auth.controllers.js';

authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.post('/signout', signOut);
authRouter.post('/reset-password/send-otp', sendOTP);
authRouter.post('/reset-password/resend-otp', resendOTP);
authRouter.post('/reset-password/verify-otp', verifyOTP);
authRouter.post('/reset-password/reset', resetPassword);
authRouter.post('/google-auth', googleAuth);

export default authRouter;