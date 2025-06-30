import express from 'express';

import mediamanagement from '@backend/api/settings/mediamanagement';
import security from '@backend/api/settings/security';

const router = express.Router();

router.use('/mediamanagement', mediamanagement);
router.use('/security', security);

export default router;
