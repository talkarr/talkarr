import express from 'express';

import handleUserDetailsRequest from '@backend/src/api/user/details';
import handleUserInfoRequest from '@backend/src/api/user/info';
import handleLoginRequest from '@backend/src/api/user/login';
import handleLogoutRequest from '@backend/src/api/user/logout';
import userPreferencesRouter from '@backend/src/api/user/preferences';
import handleRegisterInitialRequest from '@backend/src/api/user/register-initial';

const userRouter = express.Router();

userRouter.post('/login', handleLoginRequest);
userRouter.post('/logout', handleLogoutRequest);
userRouter.get('/info', handleUserInfoRequest);
userRouter.post('/register-initial', handleRegisterInitialRequest);
userRouter.get('/details', handleUserDetailsRequest);
userRouter.use(userPreferencesRouter);

export default userRouter;
