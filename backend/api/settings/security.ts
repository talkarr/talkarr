import express from 'express';

import { Permission } from '@backend/permissions';
import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { getUsers } from '@backend/users';

const log = rootLog.child({ label: 'settings/security' });

const router = express.Router();

router.get(
    '/users',
    async (
        _req: ExpressRequest<'/settings/security/users', 'get'>,
        res: ExpressResponse<'/settings/security/users', 'get'>,
    ) => {
        try {
            const users = await getUsers();

            res.json({
                success: true,
                data: {
                    available_permissions: Object.values(Permission).filter(
                        permission => typeof permission === 'string',
                    ),
                    users,
                },
            });
        } catch (error) {
            log.error('Error fetching security settings:', { error });

            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });
        }
    },
);

export default router;
