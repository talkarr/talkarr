import { verifyPermissions } from '@backend/middlewares';
import { Permission } from '@backend/permissions';
import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';
import { getUserWithPasswordById, sanitizeUser } from '@backend/users';

const log = rootLog.child({ label: 'user/details' });

const handleUserDetailsRequest = async (
    req: ExpressRequest<'/user/details', 'get'>,
    res: ExpressResponse<'/user/details', 'get'>,
): Promise<void> => {
    if (!(await verifyPermissions(req, res, Permission.Admin))) {
        return;
    }

    const { uid } = req.query;

    if (!uid) {
        log.error('uid is required.');

        res.status(400).json({
            success: false,
            error: 'uid is required.',
        });

        return;
    }

    const user = await getUserWithPasswordById(uid);

    if (!user) {
        log.error('User not found.');

        res.status(404).json({
            success: false,
            error: 'User not found.',
        });

        return;
    }

    res.status(200).json({
        success: true,
        data: sanitizeUser(user),
    });
};

export default handleUserDetailsRequest;
