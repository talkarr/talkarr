import express from 'express';

import handleAddEventRequest from '@backend/api/talks/add';
import handleDeleteEventRequest from '@backend/api/talks/delete';
import handleListEventsRequest from '@backend/api/talks/list';
import handleSearchEventsRequest from '@backend/api/talks/search';
import handleUpdateEventRequest from '@backend/api/talks/update';

const router = express.Router();

router.get('/search', handleSearchEventsRequest);

router.post('/add', handleAddEventRequest);

router.get('/list', handleListEventsRequest);

router.post('/delete', handleDeleteEventRequest);

router.post('/update', handleUpdateEventRequest);

export default router;
