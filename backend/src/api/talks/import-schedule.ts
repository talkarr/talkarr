import typia from 'typia';

import { importScheduleJson } from '@backend/src/events';
import { verifyPermissions } from '@backend/src/middlewares';
import { Permission } from '@backend/src/permissions';
import rootLog from '@backend/src/root-log';
import type {
    ExpressRequest,
    ExpressResponse,
    RequestBody,
} from '@backend/src/types';

const log = rootLog.child({ label: 'talks/import/fahrplan' });

export type ScheduleImport = RequestBody<'/talks/import/schedule'>;

const verifyScheduleEvents =
    typia.createIs<ScheduleImport['selected_events']>();

const handleImportScheduleJsonRequest = async (
    req: ExpressRequest<'/talks/import/schedule', 'post'>,
    res: ExpressResponse<'/talks/import/schedule', 'post'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.AddEvents))) {
        return;
    }

    const { selected_events: selectedEvents, root_folder: rootFolder } =
        req.body;

    if (!selectedEvents) {
        res.status(400).json({
            success: false,
            error: 'selectedEvents is required.',
        });

        return;
    }

    if (!rootFolder) {
        res.status(400).json({
            success: false,
            error: 'Root folder is required.',
        });

        return;
    }

    try {
        const valid = verifyScheduleEvents(selectedEvents);

        if (!valid) {
            res.status(400).json({
                success: false,
                error: 'Invalid schedule data (Validation failed).',
            });

            return;
        }

        // do the import here
        const result = await importScheduleJson({
            scheduleEvents: selectedEvents,
            rootFolder,
        });

        res.json({ success: true, data: result });
    } catch (error) {
        log.error('Invalid schedule data (Parse error):', { error });

        res.status(400).json({
            success: false,
            error: 'Invalid schedule data (Parse error).',
        });
    }
};

export default handleImportScheduleJsonRequest;
