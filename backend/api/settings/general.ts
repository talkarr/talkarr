import express from 'express';
import typia from 'typia';

import rootLog from '@backend/rootLog';
import { getSettings, setSettings } from '@backend/settings';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'settings/general' });

export interface GeneralSettings {
    allowLibravatar: boolean; // Allow using Libravatar for user avatars
}

const check = typia.createIs<GeneralSettings>();

const router = express.Router();

router.get(
    '/config',
    async (
        _req: ExpressRequest<'/settings/general/config', 'get'>,
        res: ExpressResponse<'/settings/general/config', 'get'>,
    ) => {
        res.json({
            success: true,
            data: getSettings().general,
        });
    },
);

router.post(
    '/config',
    async (
        req: ExpressRequest<'/settings/general/config', 'post'>,
        res: ExpressResponse<'/settings/general/config', 'post'>,
    ) => {
        const settings = req.body;

        if (!check(settings)) {
            log.warn('Invalid settings provided', { settings });
            res.status(400).json({
                success: false,
                error: 'Invalid settings provided',
            });
            return;
        }

        log.info('Updating general settings', { settings });

        try {
            await setSettings('general', settings);
        } catch (e) {
            log.error('Error saving general settings', { e });
            res.status(500).json({
                success: false,
                error: 'Error saving general settings',
            });
            return;
        }

        res.json({
            success: true,
            data: null,
        });
    },
);

export default router;
