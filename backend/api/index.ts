import cookieParser from 'cookie-parser';
import express from 'express';
import expressWinston from 'express-winston';

import cacheRouter from '@backend/api/cache';
import informationHandler from '@backend/api/information';
import settingsRouter from '@backend/api/settings';
import talksRouter from '@backend/api/talks';
import taskRouter from '@backend/api/tasks';
import userRouter from '@backend/api/user';
import { checkIsNewInstance } from '@backend/helper';
import rootLog from '@backend/rootLog';
import type { ExpressResponse } from '@backend/types';
import { userMiddleware } from '@backend/users';

const log = rootLog.child({ label: 'API' });

const router = express.Router();

router.use(
    expressWinston.logger({
        winstonInstance: log,
        meta: false,
        // responseWhitelist: ['body'],
        level: 'http',
    }),
);
router.use(cookieParser());
router.use(expressWinston.errorLogger({ winstonInstance: log }));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use(userMiddleware);

router.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

router.get('/status', async (_req, res: ExpressResponse<'/status', 'get'>) => {
    res.status(200).json({
        success: true,
        data: {
            isNewInstance: await checkIsNewInstance(),
        },
    });
});

router.get('/information', informationHandler);

router.use('/talks', talksRouter);

router.use('/settings', settingsRouter);

router.use('/tasks', taskRouter);

router.use('/user', userRouter);

router.use('/cache', cacheRouter);

router.use((_req, res) => {
    log.warn('API endpoint not found', { url: _req.originalUrl });
    res.sendStatus(404);
});

router.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        if (err) {
            log.error('Error in API middleware', {
                error: err.message,
                stack: err.stack,
            });
            res.status(500).json({
                success: false,
                error: err.message || 'Internal server error',
            });
        } else {
            next();
        }
    },
);

export default router;
