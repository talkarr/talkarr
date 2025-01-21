import { startScanForMissingFiles } from '@backend/workers/scanForMissingFiles';

import { getTalkFromApiByGuid } from '@backend/helper';
import rootLog from '@backend/rootLog';
import { addTalk } from '@backend/talks';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { AddTalkFailure } from '@backend/types';

const log = rootLog.child({ label: 'talks/add' });

const handleAddEventRequest = async (
    req: ExpressRequest<'/talks/add', 'post'>,
    res: ExpressResponse<'/talks/add', 'post'>,
): Promise<void> => {
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

    const talk = await getTalkFromApiByGuid(guid);

    if (!talk) {
        log.error('Talk not found.');

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    // Add talk to database
    const result = await addTalk(talk, rootFolder);

    if (typeof result !== 'object') {
        log.error('Error adding talk to database. Result:', {
            result,
            guid: talk.guid,
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

    startScanForMissingFiles({
        event: result,
    });

    res.json({
        success: true,
        data: null,
    });
};

export default handleAddEventRequest;
