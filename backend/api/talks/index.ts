import express from 'express';

import handleAddEventRequest from '@backend/api/talks/add';
import { handleSearchEventsRequest } from '@backend/api/talks/search';

const router = express.Router();

router.get('/search', handleSearchEventsRequest);

router.post('/add', handleAddEventRequest);

export default router;
