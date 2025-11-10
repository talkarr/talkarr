import { validate as validateEmail } from 'email-validator';

import { validatePassword } from '@backend/passwords';
import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { createInitialUser, doesEmailExist } from '@backend/users';

const log = rootLog.child({ label: 'user/register-initial' });

const handleRegisterInitialRequest = async (
    req: ExpressRequest<'/user/register-initial', 'post'>,
    res: ExpressResponse<'/user/register-initial', 'post'>,
): Promise<void> => {
    if (req.user) {
        res.status(400).json({
            success: false,
            error: 'You are already logged in.',
        });
        return;
    }

    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
        res.status(400).json({
            success: false,
            error: 'Email, password and display name are required.',
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

    if (!validatePassword(password)) {
        res.status(400).json({
            success: false,
            error: 'Password does not meet the required criteria.',
        });
        return;
    }

    const userExists = await doesEmailExist(email);

    if (userExists) {
        res.status(400).json({
            success: false,
            error: 'Email already exists.',
        });
        return;
    }

    try {
        await createInitialUser({
            email,
            displayName,
            unhashedPassword: password,
        });

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

export default handleRegisterInitialRequest;
