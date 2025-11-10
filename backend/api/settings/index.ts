import express from 'express';

import generalRouter from '@backend/api/settings/general';
import mediamanagementRouter from '@backend/api/settings/mediamanagement';
import securityRouter from '@backend/api/settings/security';
import { verifyPermissionsMiddleware } from '@backend/middlewares';
import { Permission } from '@backend/permissions';

const settingsRouter = express.Router();

settingsRouter.use(verifyPermissionsMiddleware(Permission.Admin));

settingsRouter.use('/general', generalRouter);
settingsRouter.use('/mediamanagement', mediamanagementRouter);
settingsRouter.use('/security', securityRouter);

export default settingsRouter;
