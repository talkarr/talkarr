import express from 'express';

import handleAddEventRequest from '@backend/api/talks/add';
import handleDeleteEventRequest from '@backend/api/talks/delete';
import handleGetEventRequest from '@backend/api/talks/get';
import handleEventInfoRequest from '@backend/api/talks/info';
import handleListEventsRequest from '@backend/api/talks/list';
import handleSearchEventsRequest from '@backend/api/talks/search';
import handleUpdateEventRequest from '@backend/api/talks/update';

const router = express.Router();

router.get('/search', handleSearchEventsRequest);

router.post('/add', handleAddEventRequest);

router.get('/list', handleListEventsRequest);

router.post('/delete', handleDeleteEventRequest);

router.post('/update', handleUpdateEventRequest);

router.get('/info', handleEventInfoRequest);

router.get('/get', handleGetEventRequest);

export default router;
