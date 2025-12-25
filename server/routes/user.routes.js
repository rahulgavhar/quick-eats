import express from 'express';
const userRouter = express.Router();

import { getCurrentUser, getUserCity, updateUserProfile } from '../controllers/user.controllers.js';
import { isAuth } from '../middlewares/isAuth.js';
import { locationRateLimiter } from '../middlewares/rateLimiter.js';

userRouter.get('/current', isAuth, getCurrentUser);
userRouter.put('/update', isAuth, updateUserProfile);
userRouter.post('/get-city', isAuth, locationRateLimiter, getUserCity);


export default userRouter;