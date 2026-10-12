import express from 'express';

import generalRouter from '@backend/src/api/settings/general';
import mediamanagementRouter from '@backend/src/api/settings/mediamanagement';
import securityRouter from '@backend/src/api/settings/security';
import { verifyPermissionsMiddleware } from '@backend/src/middlewares';
import { Permission } from '@backend/src/permissions';

const settingsRouter = express.Router();

settingsRouter.use(verifyPermissionsMiddleware(Permission.Admin));

settingsRouter.use('/general', generalRouter);
settingsRouter.use('/mediamanagement', mediamanagementRouter);
settingsRouter.use('/security', securityRouter);

export default settingsRouter;
