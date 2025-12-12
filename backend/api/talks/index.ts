import express from 'express';

import handleAddEventRequest from '@backend/api/talks/add';
import handleBasicListEventsRequest from '@backend/api/talks/basic-list';
import handleDeleteEventRequest from '@backend/api/talks/delete';
import handleGetEventRequest from '@backend/api/talks/get';
import handleImportFahrplanJsonRequest from '@backend/api/talks/import-fahrplan';
import handleVerifyFahrplanJsonRequest from '@backend/api/talks/import-fahrplan-verify';
import handleEventInfoRequest from '@backend/api/talks/info';
import handleListEventsRequest from '@backend/api/talks/list';
import handleScanEventsRequest from '@backend/api/talks/scan';
import handleSearchEventsRequest from '@backend/api/talks/search';
import handleUpdateEventRequest from '@backend/api/talks/update';
import { requireUserMiddleware } from '@backend/users';
import handleImportScheduleJsonRequest from '@backend/api/talks/import-schedule';

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
