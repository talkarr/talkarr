import type { ExpressRequest, ExpressResponse } from '@backend/types';

const handleUserInfoRequest = async (
    req: ExpressRequest<'/user/info', 'get'>,
    res: ExpressResponse<'/user/info', 'get'>,
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'You are not logged in.',
        });
        return;
    }

    res.status(200).json({
        success: true,
        data: req.user,
    });
};

export default handleUserInfoRequest;
