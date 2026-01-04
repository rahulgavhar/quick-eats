import express from 'express';
const userRouter = express.Router();

import { getCurrentUser, getUserCity, updateUserLocation, updateUserProfile } from '../controllers/user.controllers.js';
import { isAuth } from '../middlewares/auth.js';
import { locationRateLimiter } from '../middlewares/rateLimiter.js';

userRouter.get('/current', isAuth, getCurrentUser);
userRouter.put('/update', isAuth, updateUserProfile);
userRouter.post('/get-city', locationRateLimiter, getUserCity);
userRouter.post('/update-location', isAuth, updateUserLocation)


export default userRouter;