import type { ExpressRequest, ExpressResponse } from '@backend/types';
import {
    getUserWithPasswordById,
    requireUser,
    sanitizeUser,
} from '@backend/users';

const handleUserInfoRequest = async (
    req: ExpressRequest<'/user/info', 'get'>,
    res: ExpressResponse<'/user/info', 'get'>,
): Promise<void> => {
    if (!(await requireUser(req, res))) {
        return;
    }

    const user = await getUserWithPasswordById(req.user!.id);

    if (!user) {
        res.status(400).json({
            success: false,
            error: 'User not found',
        });
        return;
    }

    res.status(200).json({
        success: true,
        data: sanitizeUser(user),
    });
};

export default handleUserInfoRequest;
