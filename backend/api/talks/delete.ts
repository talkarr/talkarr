import { deleteTalk } from '@backend/events';
import { verifyPermissions } from '@backend/middlewares';
import { Permission } from '@backend/permissions';
import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'talks/delete' });

const handleDeleteEventRequest = async (
    req: ExpressRequest<'/talks/delete', 'post'>,
    res: ExpressResponse<'/talks/delete', 'post'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.DeleteEvents))) {
        return;
    }

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
    const result = await deleteTalk({ guid, deleteFiles });

    if (!result) {
        log.error('Error removing talk from database.', { guid, deleteFiles });

        res.status(500).json({
            success: false,
            error: 'Error removing talk from database.',
        });

        return;
    }

    res.json({
        success: true,
        data: null,
    });
};

export default handleDeleteEventRequest;
