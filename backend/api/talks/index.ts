import express from 'express';

import handleAddEventRequest from '@backend/api/talks/add';
import handleBasicListEventsRequest from '@backend/api/talks/basic-list';
import handleDeleteEventRequest from '@backend/api/talks/delete';
import handleGetEventRequest from '@backend/api/talks/get';
import handleImportJsonRequest from '@backend/api/talks/import';
import handleVerifyJsonRequest from '@backend/api/talks/import-verify';
import handleEventInfoRequest from '@backend/api/talks/info';
import handleListEventsRequest from '@backend/api/talks/list';
import handleScanEventsRequest from '@backend/api/talks/scan';
import handleSearchEventsRequest from '@backend/api/talks/search';
import handleUpdateEventRequest from '@backend/api/talks/update';

const router = express.Router();

router.get('/search', handleSearchEventsRequest);

router.post('/add', handleAddEventRequest);

router.get('/list', handleListEventsRequest);

router.get('/basic-list', handleBasicListEventsRequest);

router.post('/delete', handleDeleteEventRequest);

router.post('/update', handleUpdateEventRequest);

router.get('/info', handleEventInfoRequest);

router.get('/get', handleGetEventRequest);

router.post('/scan', handleScanEventsRequest);

router.post('/import', handleImportJsonRequest);

router.post('/import/verify', handleVerifyJsonRequest);

export default router;
