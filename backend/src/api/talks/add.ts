import { startScanForMissingFiles } from '@backend/workers/scan-for-missing-files';

import { addTalk, fixBigintInExtendedDbEvent } from '@backend/events';
import { getTalkFromApiByGuid } from '@backend/helper';
import { verifyPermissions } from '@backend/middlewares';
import { Permission } from '@backend/permissions';
import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { AddTalkFailure } from '@backend/types';

const log = rootLog.child({ label: 'talks/add' });

const handleAddEventRequest = async (
    req: ExpressRequest<'/talks/add', 'post'>,
    res: ExpressResponse<'/talks/add', 'post'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.AddEvents))) {
        return;
    }

    const { guid, root_folder: rootFolder } = req.body;

    if (!guid) {
        log.error('GUID is required.');

        res.status(400).json({
            success: false,
            error: 'GUID is required.',
        });

        return;
    }

    if (!rootFolder) {
        log.error('Root folder is required.');

        res.status(400).json({
            success: false,
            error: 'Root folder is required.',
        });

        return;
    }

    let event;

    try {
        event = await getTalkFromApiByGuid({ guid });

        if (!event) {
            log.error('Talk not found.');

            res.status(404).json({
                success: false,
                error: 'Talk not found.',
            });

            return;
        }
    } catch (error) {
        log.error('Error fetching talk from API:', {
            error,
            guid,
        });

        res.status(500).json({
            success: false,
            error: 'Error fetching talk from API.',
        });

        return;
    }

    // Add talk to database
    const result = await addTalk({ event, rootFolder });

    if (typeof result !== 'object') {
        log.error('Error adding talk to database. Result:', {
            result,
            guid: event.guid,
        });

        if (result === AddTalkFailure.Duplicate) {
            res.status(409).json({
                success: false,
                error: 'Talk already exists in database.',
            });

            return;
        }

        res.status(500).json({
            success: false,
            error: 'Error adding talk to database.',
        });

        return;
    }

    await startScanForMissingFiles({
        event: fixBigintInExtendedDbEvent(result),
    });

    res.json({
        success: true,
        data: null,
    });
};

export default handleAddEventRequest;
