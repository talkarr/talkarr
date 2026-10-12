import queue from '@backend/src/queue';
import type { ExpressRequest, ExpressResponse } from '@backend/src/types';
import { taskValidators } from '@backend/src/workers';

const handleTaskInfoRequest = async (
    _req: ExpressRequest<'/tasks/status', 'get'>,
    res: ExpressResponse<'/tasks/status', 'get'>,
): Promise<void> => {
    res.json({
        success: true,
        data: {
            tasks: queue.getJobs(),
            valid_tasks: Object.keys(taskValidators),
        },
    });
};

export default handleTaskInfoRequest;
