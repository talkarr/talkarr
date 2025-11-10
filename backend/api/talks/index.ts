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
import { requireUserMiddleware } from '@backend/users';

const talkRouter = express.Router();

talkRouter.use(requireUserMiddleware);

talkRouter.get('/search', handleSearchEventsRequest);

talkRouter.post('/add', handleAddEventRequest);

talkRouter.get('/list', handleListEventsRequest);

talkRouter.get('/basic-list', handleBasicListEventsRequest);

talkRouter.post('/delete', handleDeleteEventRequest);

talkRouter.post('/update', handleUpdateEventRequest);

talkRouter.get('/info', handleEventInfoRequest);

talkRouter.get('/get', handleGetEventRequest);

talkRouter.post('/scan', handleScanEventsRequest);

talkRouter.post('/import', handleImportJsonRequest);

talkRouter.post('/import/verify', handleVerifyJsonRequest);

export default talkRouter;
