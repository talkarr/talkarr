import queue from '@backend/queue';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { verifyPermissions } from '@backend/users';
import { taskValidators } from '@backend/workers';

const handleTaskInfoRequest = async (
    req: ExpressRequest<'/tasks/status', 'get'>,
    res: ExpressResponse<'/tasks/status', 'get'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, ['Admin']))) {
        return;
    }

    res.json({
        success: true,
        data: {
            tasks: queue.getJobs(),
            valid_tasks: Object.keys(taskValidators),
        },
    });
};

export default handleTaskInfoRequest;
