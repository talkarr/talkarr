import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { requireUser, sanitizeUser } from '@backend/users';

const handleUserInfoRequest = async (
    req: ExpressRequest<'/user/info', 'get'>,
    res: ExpressResponse<'/user/info', 'get'>,
): Promise<void> => {
    if (!(await requireUser(req, res))) {
        return;
    }

    res.status(200).json({
        success: true,
        data: sanitizeUser(req.user!),
    });
};

export default handleUserInfoRequest;
