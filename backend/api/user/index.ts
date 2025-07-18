import express from 'express';

import handleUserInfoRequest from '@backend/api/user/info';
import handleLoginRequest from '@backend/api/user/login';
import handleLogoutRequest from '@backend/api/user/logout';
import handleRegisterInitialRequest from '@backend/api/user/register-initial';

const router = express.Router();

router.post('/login', handleLoginRequest);
router.post('/logout', handleLogoutRequest);
router.get('/info', handleUserInfoRequest);
router.post('/register-initial', handleRegisterInitialRequest);

export default router;
