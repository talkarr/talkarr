import typia from 'typia';

import { importEventFahrplanJson } from '@backend/events';
import rootLog from '@backend/rootLog';
import type {
    EventFahrplanJsonImport,
    ExpressRequest,
    ExpressResponse,
} from '@backend/types';

const verifyJson = typia.createIs<EventFahrplanJsonImport>();

const log = rootLog.child({ label: 'talks/import' });

const handleImportJsonRequest = async (
    req: ExpressRequest<'/talks/import', 'post'>,
    res: ExpressResponse<'/talks/import', 'post'>,
): Promise<void> => {
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

        const valid = verifyJson(data);

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

export default handleImportJsonRequest;
