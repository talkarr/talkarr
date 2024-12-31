import { getTalkByGuid } from '@backend/helper';
import rootLog from '@backend/rootLog';
import { addTalk, AddTalkFailure, deleteTalk } from '@backend/talks';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'talks/delete' });

export const handleDeleteEventRequest = async (
    req: ExpressRequest<'/talks/delete', 'post'>,
    res: ExpressResponse<'/talks/delete', 'post'>,
): Promise<void> => {
    const { guid, delete_files: deleteFiles } = req.body;

    if (!guid) {
        log.error('GUID is required.');

        res.status(400).json({
            success: false,
            error: 'GUID is required.',
        });

        return;
    }

    if (typeof deleteFiles !== 'boolean') {
        log.error('delete_files is required.');

        res.status(400).json({
            success: false,
            error: 'delete_files is required.',
        });

        return;
    }

    // Add talk to database
    const result = await deleteTalk(guid);

    if (deleteFiles) {
        log.warn('HANDLE DELETE EVENT REQUEST NOT IMPLEMENTED');
    }

    if (!result) {
        log.error('Error removing talk from database.');

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

export default handleDeleteEventRequest;
