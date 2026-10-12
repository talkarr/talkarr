import typia from 'typia';

import { importEventFahrplanJson } from '@backend/src/events';
import { verifyPermissions } from '@backend/src/middlewares';
import { Permission } from '@backend/src/permissions';
import rootLog from '@backend/src/root-log';
import type {
    EventFahrplanJsonImport,
    ExpressRequest,
    ExpressResponse,
} from '@backend/src/types';

const verifyFahrplanJson = typia.createIs<EventFahrplanJsonImport>();

const log = rootLog.child({ label: 'talks/import/fahrplan' });

const handleImportFahrplanJsonRequest = async (
    req: ExpressRequest<'/talks/import/fahrplan', 'post'>,
    res: ExpressResponse<'/talks/import/fahrplan', 'post'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.AddEvents))) {
        return;
    }

    const { json, root_folder: rootFolder } = req.body;

    if (!json) {
        res.status(400).json({
            success: false,
            error: 'JSON is required.',
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
        const data = JSON.parse(json);

        const valid = verifyFahrplanJson(data);

        if (!valid) {
            res.status(400).json({
                success: false,
                error: 'Invalid JSON (Schema validation failed).',
            });

            return;
        }

        if (data.lectures.length === 0) {
            res.status(400).json({
                success: false,
                error: 'No lectures found in JSON.',
            });

            return;
        }

        // do the import here
        const result = await importEventFahrplanJson({
            lectures: data.lectures,
            rootFolder,
        });

        res.json({ success: true, data: result });
    } catch (error) {
        log.error('Invalid JSON (Parse error):', { error });

        res.status(400).json({
            success: false,
            error: 'Invalid JSON (Parse error).',
        });
    }
};

export default handleImportFahrplanJsonRequest;
