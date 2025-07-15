import typia from 'typia';

import rootLog from '@backend/rootLog';
import type {
    EventFahrplanJsonImport,
    ExpressRequest,
    ExpressResponse,
} from '@backend/types';

const verifyJson = typia.createIs<EventFahrplanJsonImport>();

const log = rootLog.child({ label: 'talks/import/verify' });

const handleVerifyJsonRequest = async (
    req: ExpressRequest<'/talks/import/verify', 'post'>,
    res: ExpressResponse<'/talks/import/verify', 'post'>,
): Promise<void> => {
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

        res.json({ success: true, data: null });
    } catch (error) {
        log.debug('Invalid JSON (Parse error):', { error });

        res.status(400).json({
            success: false,
            error: 'Invalid JSON (Parse error).',
        });
    }
};

export default handleVerifyJsonRequest;
