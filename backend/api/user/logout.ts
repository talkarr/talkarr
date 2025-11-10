import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { clearUserCookie, requireUser } from '@backend/users';

const handleLogoutRequest = async (
    req: ExpressRequest<'/user/logout', 'post'>,
    res: ExpressResponse<'/user/logout', 'post'>,
): Promise<void> => {
    if (!(await requireUser(req, res))) {
        return;
    }

    clearUserCookie(res);

    res.status(200).json({
        success: true,
        data: null,
    });
};

export default handleLogoutRequest;
