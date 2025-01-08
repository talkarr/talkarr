import express from 'express';
import expressWinston from 'express-winston';

import settingsRouter from '@backend/api/settings';
import talksRouter from '@backend/api/talks';
import taskRouter from '@backend/api/tasks';
import rootLog from '@backend/rootLog';

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
router.use(expressWinston.errorLogger({ winstonInstance: log }));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/healthz', (_req, res) => {
    res.sendStatus(200);
});

router.use('/talks', talksRouter);

router.use('/settings', settingsRouter);

router.use('/tasks', taskRouter);

router.use((_req, res) => {
    res.sendStatus(404);
});

export default router;
