import express from 'express';

import handleExecuteTaskRequest from '@backend/src/api/tasks/execute';
import handleTaskInfoRequest from '@backend/src/api/tasks/status';
import { verifyPermissionsMiddleware } from '@backend/src/middlewares';
import { Permission } from '@backend/src/permissions';

const tasksRouter = express.Router();

tasksRouter.use(verifyPermissionsMiddleware(Permission.Admin));

tasksRouter.post('/execute', handleExecuteTaskRequest);

tasksRouter.get('/status', handleTaskInfoRequest);

export default tasksRouter;
