import express from 'express';

import mediamanagement from '@backend/api/settings/mediamanagement';

const router = express.Router();

router.use('/mediamanagement', mediamanagement);

export default router;
