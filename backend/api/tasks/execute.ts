import queue from '@backend/queue';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { isValidData, taskValidators } from '@backend/workers';

const handleExecuteTaskRequest = async (
    req: ExpressRequest<'/tasks/execute', 'post'>,
    res: ExpressResponse<'/tasks/execute', 'post'>,
): Promise<void> => {
    const { task_name: taskName, data } = req.body;

    if (!taskName) {
        res.status(400).json({
            success: false,
            error: 'taskName is required.',
        });

        return;
    }

    if (!(taskName in taskValidators)) {
        res.status(400).json({
            success: false,
            error: 'Invalid taskName.',
        });

        return;
    }

    const verifiedTaskName = taskName as keyof typeof taskValidators;

    const isValid = isValidData(verifiedTaskName, data);

    if (!isValid) {
        res.status(400).json({
            success: false,
            error: 'Invalid data.',
        });

        return;
    }

    const result = await queue.enqueueJob(verifiedTaskName, data);

    if (!result) {
        res.status(500).json({
            success: false,
            error: 'Failed to enqueue task.',
        });

        return;
    }

    res.json({
        success: true,
        data: {
            task_id: result.id.toString(),
        },
    });
};

export default handleExecuteTaskRequest;
