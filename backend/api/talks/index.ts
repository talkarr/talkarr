import express from 'express';

import handleAddEventRequest from '@backend/api/talks/add';
import handleListEventsRequest from '@backend/api/talks/list';
import { handleSearchEventsRequest } from '@backend/api/talks/search';

const router = express.Router();

router.get('/search', handleSearchEventsRequest);

router.post('/add', handleAddEventRequest);

router.get('/list', handleListEventsRequest);

export default router;
