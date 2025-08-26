import express from 'express';
import { Signup, Signin, GetUser, UpdateNotificationSettings, ChangePassword, ForgotPassword, ResetPassword } from '../controller/user';
import { decodeUser } from '../middleware/authMiddleware';

const userRouter: express.Router = express.Router();

// Public routes (no auth required)
userRouter.post('/signup', Signup);
userRouter.post('/signin', Signin);
userRouter.post('/forgot-password', ForgotPassword);
userRouter.post('/reset-password', ResetPassword);

// Protected routes (auth required)
userRouter.get('/me', decodeUser, GetUser);
userRouter.patch('/notification-settings', decodeUser, UpdateNotificationSettings);
userRouter.patch('/change-password', decodeUser, ChangePassword);

export { userRouter };
