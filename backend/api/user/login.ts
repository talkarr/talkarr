import { validate as validateEmail } from 'email-validator';

import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import {
    getUserWithPasswordByEmail,
    setUserCookie,
    verifyPassword,
} from '@backend/users';

const log = rootLog.child({ label: 'user/login' });

const handleLoginRequest = async (
    req: ExpressRequest<'/user/login', 'post'>,
    res: ExpressResponse<'/user/login', 'post'>,
): Promise<void> => {
    if (req.user) {
        res.status(400).json({
            success: false,
            error: 'You are already logged in.',
        });
        return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            success: false,
            error: 'Email and password are required.',
        });
        return;
    }

    if (!validateEmail(email)) {
        res.status(400).json({
            success: false,
            error: 'Invalid email format.',
        });
        return;
    }

    const userFromDatabase = await getUserWithPasswordByEmail(email);

    if (!userFromDatabase) {
        res.status(401).json({
            success: false,
            error: 'Invalid email or password.',
        });
        return;
    }

    try {
        const passwordValid = await verifyPassword(userFromDatabase, password);

        if (!passwordValid) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
            });
            return;
        }

        setUserCookie(res, userFromDatabase);

        res.status(200).json({
            success: true,
            data: null,
        });
    } catch (error) {
        log.error('Error during password verification:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login.',
        });
    }
};

export default handleLoginRequest;
