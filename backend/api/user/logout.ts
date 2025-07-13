import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { clearUserCookie } from '@backend/users';

const handleLogoutRequest = async (
    _req: ExpressRequest<'/user/logout', 'post'>,
    res: ExpressResponse<'/user/logout', 'post'>,
): Promise<void> => {
    clearUserCookie(res);

    res.status(200).json({
        success: true,
        data: null,
    });
};

export default handleLogoutRequest;
