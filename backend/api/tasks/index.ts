import express from 'express';

import handleExecuteTaskRequest from '@backend/api/tasks/execute';

const router = express.Router();

router.post('/execute', handleExecuteTaskRequest);

export default router;
