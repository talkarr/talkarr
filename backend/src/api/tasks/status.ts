import queue from '@backend/queue';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { taskValidators } from '@backend/workers';

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
