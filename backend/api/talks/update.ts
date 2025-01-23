import { updateTalk } from '@backend/events';
import { getTalkFromApiByGuid } from '@backend/helper';
import rootLog from '@backend/rootLog';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'talks/update' });

const handleUpdateEventRequest = async (
    req: ExpressRequest<'/talks/update', 'post'>,
    res: ExpressResponse<'/talks/update', 'post'>,
): Promise<void> => {
    const { guid } = req.body;

    if (!guid) {
        log.error('GUID is required.');

        res.status(400).json({
            success: false,
            error: 'GUID is required.',
        });

        return;
    }

    const event = await getTalkFromApiByGuid({ guid });

    if (!event) {
        log.error('Talk not found.', { guid });

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    // Add talk to database
    const result = await updateTalk({ guid, event });

    if (typeof result !== 'object') {
        log.error('Error adding talk to database. Result:', { result, guid });

        res.status(500).json({
            success: false,
            error: 'Error adding talk to database.',
        });

        return;
    }

    res.json({
        success: true,
        data: null,
    });
};

export default handleUpdateEventRequest;
