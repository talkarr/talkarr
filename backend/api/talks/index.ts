import express from 'express';

import handleAddEventRequest from '@backend/api/talks/add';
import handleDeleteEventRequest from '@backend/api/talks/delete';
import handleGetEventRequest from '@backend/api/talks/get';
import handleVerifyJsonRequest from '@backend/api/talks/importVerify';
import handleEventInfoRequest from '@backend/api/talks/info';
import handleListEventsRequest from '@backend/api/talks/list';
import handleScanEventsRequest from '@backend/api/talks/scan';
import handleSearchEventsRequest from '@backend/api/talks/search';
import handleUpdateEventRequest from '@backend/api/talks/update';
import handleImportJsonRequest from '@backend/api/talks/import';

const router = express.Router();

router.get('/search', handleSearchEventsRequest);

router.post('/add', handleAddEventRequest);

router.get('/list', handleListEventsRequest);

router.post('/delete', handleDeleteEventRequest);

router.post('/update', handleUpdateEventRequest);

router.get('/info', handleEventInfoRequest);

router.get('/get', handleGetEventRequest);

router.post('/scan', handleScanEventsRequest);

router.post('/import', handleImportJsonRequest);

router.post('/import/verify', handleVerifyJsonRequest);

export default router;
