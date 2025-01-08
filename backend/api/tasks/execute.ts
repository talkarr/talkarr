import queue from '@backend/queue';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { isValidData } from '@backend/workers';

// TODO
const handleExecuteTaskRequest = async (
    req: ExpressRequest<'/tasks/execute', 'post'>,
    res: ExpressResponse<'/tasks/execute', 'post'>,
): Promise<void> => {
    const { taskName, data } = req.body;

    if (!taskName) {
        res.status(400).json({
            success: false,
            error: 'taskName is required.',
        });

        return;
    }

    const isValid = isValidData(taskName, data);

    if (!isValid) {
        res.status(400).json({
            success: false,
            error: 'Invalid data.',
        });

        return;
    }

    const result = await queue.add(taskName, data, { removeOnComplete: true });

    res.json({
        success: true,
        data: {
            id: result.id,
        },
    });
};

export default handleExecuteTaskRequest;
