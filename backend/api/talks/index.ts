import express from 'express';

import { handleSearchEventsRequest } from '@backend/api/talks/search';

const router = express.Router();

router.get('/search', handleSearchEventsRequest);

export default router;
