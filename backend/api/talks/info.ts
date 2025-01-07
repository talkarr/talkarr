import rootLog from '@backend/rootLog';
import { getTalkInfoByGuid } from '@backend/talks';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'talks/info' });

const handleEventInfoRequest = async (
    req: ExpressRequest<'/talks/info', 'get'>,
    res: ExpressResponse<'/talks/info', 'get'>,
): Promise<void> => {
    const { guid } = req.query;

    if (!guid) {
        log.error('GUID is required.');

        res.status(400).json({
            success: false,
            error: 'GUID is required.',
        });

        return;
    }

    const talk = await getTalkInfoByGuid(guid);

    if (!talk) {
        log.error('Talk not found.');

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    res.json({
        success: true,
        data: talk,
    });
};

export default handleEventInfoRequest;
