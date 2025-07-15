import express from 'express';

import generalRouter from '@backend/api/settings/general';
import mediamanagementRouter from '@backend/api/settings/mediamanagement';
import securityRouter from '@backend/api/settings/security';

const router = express.Router();

router.use('/general', generalRouter);
router.use('/mediamanagement', mediamanagementRouter);
router.use('/security', securityRouter);

export default router;
