import express from 'express';

import handleExecuteTaskRequest from '@backend/api/tasks/execute';
import handleTaskInfoRequest from '@backend/api/tasks/status';

const router = express.Router();

router.post('/execute', handleExecuteTaskRequest);

router.get('/status', handleTaskInfoRequest);

export default router;
