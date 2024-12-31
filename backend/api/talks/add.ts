import { getTalkByGuid } from '@backend/helper';
import rootLog from '@backend/rootLog';
import { addTalk, AddTalkFailure } from '@backend/talks';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'talks/add' });

export const handleAddEventRequest = async (
    req: ExpressRequest<'/talks/add', 'post'>,
    res: ExpressResponse<'/talks/add', 'post'>,
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

    const talk = await getTalkByGuid(guid);

    if (!talk) {
        log.error('Talk not found.');

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    // Add talk to database
    const result = await addTalk(talk);

    if (typeof result !== 'object') {
        log.error('Error adding talk to database. Result:', { result });

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

    res.json({
        success: true,
        data: null,
    });
};

export default handleAddEventRequest;
