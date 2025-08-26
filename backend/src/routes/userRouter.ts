import express from 'express';
import { Signup, Signin, GetUser, UpdateNotificationSettings } from '../controller/user';
import { decodeUser } from '../middleware/authMiddleware';

const userRouter: express.Router = express.Router();

userRouter.post('/signup', Signup);
userRouter.post('/signin', Signin);

userRouter.get('/me', decodeUser, GetUser);
userRouter.patch('/notification-settings', decodeUser, UpdateNotificationSettings);

export { userRouter };
