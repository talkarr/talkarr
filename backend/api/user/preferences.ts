import express from 'express';
import typia from 'typia';

import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import type { UserPreferences } from '@backend/user-preferences';
import {
    getUserWithPasswordById,
    requireUser,
    updateUserPreferences,
    validateUserPreferences,
} from '@backend/users';

const log = rootLog.child({ label: 'settings/general' });

const check = typia.createIs<UserPreferences>();

const userPreferencesRouter = express.Router();

userPreferencesRouter.get(
    '/preferences',
    async (
        req: ExpressRequest<'/user/preferences', 'get'>,
        res: ExpressResponse<'/user/preferences', 'get'>,
    ) => {
        if (!(await requireUser(req, res))) {
            return;
        }

        const user = await getUserWithPasswordById(req.user!.id);

        if (!user) {
            res.status(400).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: user.preferences,
        });
    },
);

userPreferencesRouter.post(
    '/preferences',
    async (
        req: ExpressRequest<'/user/preferences', 'post'>,
        res: ExpressResponse<'/user/preferences', 'post'>,
    ) => {
        if (!(await requireUser(req, res))) {
            return;
        }

        const userPreferences = req.body;

        if (
            !req.user ||
            !check(userPreferences) ||
            !validateUserPreferences(userPreferences)
        ) {
            log.warn('Invalid settings provided', {
                userPreferences,
            });
            res.status(400).json({
                success: false,
                error: 'Invalid settings provided',
            });
            return;
        }

        log.info('Updating user preferences', { userPreferences });

        try {
            await updateUserPreferences(req.user.id, userPreferences);
        } catch (error) {
            log.error('Error saving user preferences', { e: error });
            res.status(500).json({
                success: false,
                error: 'Error saving user preferences',
            });
            return;
        }

        res.json({
            success: true,
            data: null,
        });
    },
);

export default userPreferencesRouter;
