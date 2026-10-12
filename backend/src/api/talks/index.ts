import express from 'express';

import handleAddEventRequest from '@backend/src/api/talks/add';
import handleBasicListEventsRequest from '@backend/src/api/talks/basic-list';
import handleDeleteEventRequest from '@backend/src/api/talks/delete';
import handleGetEventRequest from '@backend/src/api/talks/get';
import handleImportFahrplanJsonRequest from '@backend/src/api/talks/import-fahrplan';
import handleVerifyFahrplanJsonRequest from '@backend/src/api/talks/import-fahrplan-verify';
import handleImportScheduleJsonRequest from '@backend/src/api/talks/import-schedule';
import handleEventInfoRequest from '@backend/src/api/talks/info';
import handleListEventsRequest from '@backend/src/api/talks/list';
import handleScanEventsRequest from '@backend/src/api/talks/scan';
import handleSearchEventsRequest from '@backend/src/api/talks/search';
import handleUpdateEventRequest from '@backend/src/api/talks/update';
import { requireUserMiddleware } from '@backend/src/users';

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

talkRouter.post('/import/fahrplan', handleImportFahrplanJsonRequest);

talkRouter.post('/import/fahrplan/verify', handleVerifyFahrplanJsonRequest);

talkRouter.post('/import/schedule', handleImportScheduleJsonRequest);

export default talkRouter;
