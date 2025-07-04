import express from 'express';

import { setSettings } from '@backend/settings';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const router = express.Router();

router.post(
    '/',
    async (
        req: ExpressRequest<'/settings/oidc', 'post'>,
        res: ExpressResponse<'/settings/oidc', 'post'>,
    ) => {
        const { wellKnownUrl, clientId, clientSecret } = req.body;

        if (!wellKnownUrl || !clientId || !clientSecret) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        try {
            await setSettings('oidc', {
                wellKnownUrl,
                clientId,
                clientSecret,
            });

            res.json({ success: true, data: null });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });
        }
    },
);

export default router;
