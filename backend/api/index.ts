import express from 'express';
import expressWinston from 'express-winston';

import { handleSearchEventsRequest } from '@backend/api/search';
import log from '@backend/log';

const router = express.Router();

router.use(
    expressWinston.logger({
        winstonInstance: log,
        meta: false,
        // responseWhitelist: ['body'],
    }),
);
router.use(expressWinston.errorLogger({ winstonInstance: log }));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/healthz', (_req, res) => {
    res.sendStatus(200);
});

router.get('/search', handleSearchEventsRequest);

export default router;
