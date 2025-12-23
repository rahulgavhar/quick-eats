import express from 'express';
const userRouter = express.Router();

import { getCurrentUser } from '../controllers/user.controllers.js';
import { isAuth } from '../middlewares/isAuth.js';

userRouter.get('/current', isAuth, getCurrentUser);


export default userRouter;