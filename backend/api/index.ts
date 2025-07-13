import cookieParser from 'cookie-parser';
import express from 'express';
import expressWinston from 'express-winston';

import settingsRouter from '@backend/api/settings';
import talksRouter from '@backend/api/talks';
import taskRouter from '@backend/api/tasks';
import userRouter from '@backend/api/user';
import rootLog from '@backend/rootLog';
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

router.use('/talks', talksRouter);

router.use('/settings', settingsRouter);

router.use('/tasks', taskRouter);

router.use('/user', userRouter);

router.use((_req, res) => {
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
