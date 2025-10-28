import express from 'express';

import handleUserDetailsRequest from '@backend/api/user/details';
import handleUserInfoRequest from '@backend/api/user/info';
import handleLoginRequest from '@backend/api/user/login';
import handleLogoutRequest from '@backend/api/user/logout';
import handleRegisterInitialRequest from '@backend/api/user/register-initial';

const router = express.Router();

router.post('/login', handleLoginRequest);
router.post('/logout', handleLogoutRequest);
router.get('/info', handleUserInfoRequest);
router.post('/register-initial', handleRegisterInitialRequest);
router.get('/details', handleUserDetailsRequest);

export default router;
