import express from 'express';

import handleExecuteTaskRequest from '@backend/api/tasks/execute';
import handleTaskInfoRequest from '@backend/api/tasks/status';
import { verifyPermissionsMiddleware } from '@backend/middlewares';
import { Permission } from '@backend/permissions';

const tasksRouter = express.Router();

tasksRouter.use(verifyPermissionsMiddleware(Permission.Admin));

tasksRouter.post('/execute', handleExecuteTaskRequest);

tasksRouter.get('/status', handleTaskInfoRequest);

export default tasksRouter;
