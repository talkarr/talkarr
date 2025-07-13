import express from 'express';

import generalRouter from '@backend/api/settings/general';
import mediamanagementRouter from '@backend/api/settings/mediamanagement';
import oidc from '@backend/api/settings/oidc';
import securityRouter from '@backend/api/settings/security';

const router = express.Router();

router.use('/general', generalRouter);
router.use('/mediamanagement', mediamanagementRouter);
router.use('/security', securityRouter);
router.use('/oidc', oidc);

export default router;
