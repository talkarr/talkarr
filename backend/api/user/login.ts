import argon2 from 'argon2';

import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { getUserWithPasswordByEmail, setUserCookie } from '@backend/users';

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

    const userFromDatabase = await getUserWithPasswordByEmail(email);

    if (!userFromDatabase) {
        res.status(401).json({
            success: false,
            error: 'Invalid email or password.',
        });
        return;
    }

    try {
        const passwordValid = await argon2.verify(
            userFromDatabase?.password ?? 'nopasswordprovided',
            password,
        );

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
        console.error('Error during password verification:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login.',
        });
    }
};

export default handleLoginRequest;
