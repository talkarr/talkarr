import express from 'express';

import handleUserDetailsRequest from '@backend/api/user/details';
import handleUserInfoRequest from '@backend/api/user/info';
import handleLoginRequest from '@backend/api/user/login';
import handleLogoutRequest from '@backend/api/user/logout';
import userPreferencesRouter from '@backend/api/user/preferences';
import handleRegisterInitialRequest from '@backend/api/user/register-initial';

const userRouter = express.Router();

userRouter.post('/login', handleLoginRequest);
userRouter.post('/logout', handleLogoutRequest);
userRouter.get('/info', handleUserInfoRequest);
userRouter.post('/register-initial', handleRegisterInitialRequest);
userRouter.get('/details', handleUserDetailsRequest);
userRouter.use(userPreferencesRouter);

export default userRouter;
