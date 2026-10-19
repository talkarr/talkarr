import typia from 'typia';

import { verifyPermissions } from '@backend/middlewares';
import { Permission } from '@backend/permissions';
import rootLog from '@backend/root-log';
import type {
    EventFahrplanJsonImport,
    ExpressRequest,
    ExpressResponse,
} from '@backend/types';

const verifyFahrplanJson = typia.createIs<EventFahrplanJsonImport>();

const log = rootLog.child({ label: 'talks/import/fahrplan/verify' });

const handleVerifyFahrplanJsonRequest = async (
    req: ExpressRequest<'/talks/import/fahrplan/verify', 'post'>,
    res: ExpressResponse<'/talks/import/fahrplan/verify', 'post'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.AddEvents))) {
        return;
    }

    const { json } = req.body;

    if (!json) {
        res.status(400).json({
            success: false,
            error: 'JSON is required.',
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

        res.json({ success: true, data: null });
    } catch (error) {
        log.debug('Invalid JSON (Parse error):', { error });

        res.status(400).json({
            success: false,
            error: 'Invalid JSON (Parse error).',
        });
    }
};

export default handleVerifyFahrplanJsonRequest;
