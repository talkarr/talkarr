import { updateTalk } from '@backend/src/events';
import { getTalkFromApiByGuid } from '@backend/src/helper';
import { verifyPermissions } from '@backend/src/middlewares';
import { Permission } from '@backend/src/permissions';
import rootLog from '@backend/src/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/src/types';

const log = rootLog.child({ label: 'talks/update' });

const handleUpdateEventRequest = async (
    req: ExpressRequest<'/talks/update', 'post'>,
    res: ExpressResponse<'/talks/update', 'post'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.EditEvents))) {
        return;
    }

    const { guid } = req.body;

    if (!guid) {
        log.error('GUID is required.');

        res.status(400).json({
            success: false,
            error: 'GUID is required.',
        });

        return;
    }

    let event;

    try {
        event = await getTalkFromApiByGuid({ guid });

        if (!event) {
            log.error('Talk not found.', { guid });

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
