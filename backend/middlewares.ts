import type express from 'express';
import type { RequestHandler } from 'express-serve-static-core';

import type { CheckPermissionsOptions, Permission } from '@backend/permissions';
import { checkPermissions } from '@backend/permissions';
import rootLog from '@backend/root-log';
import type { SchemaUserWithPassword } from '@backend/users';
import { getUserWithPasswordById, requireUser } from '@backend/users';

const log = rootLog.child({ label: 'middlewares' });

export const verifyPermissions = async (
    req: express.Request<any, any, any, any, any>,
    res: express.Response,
    permissions: Permission | Permission[],
    options?: CheckPermissionsOptions,
): Promise<boolean> => {
    const hasUser = await requireUser(req, res);

    if (!hasUser) {
        // error handled by requireUser() function
        return false;
    }

    const userId = (req as unknown as { user: SchemaUserWithPassword }).user.id;

    const user = await getUserWithPasswordById(userId);

    if (!user) {
        log.warn('User not found');
        res.status(400).json({
            success: false,
            error: 'Invalid request',
        });
        return false;
    }

    const hasPermissions = checkPermissions(user, permissions, options);

    if (!hasPermissions) {
        log.warn('User has insufficient permissions', {
            required: permissions,
            provided: user.permissions,
        });
        res.status(401).json({
            success: false,
            error: 'User does not have sufficient permissions',
        });
        return false;
    }

    return true;
};

export const verifyPermissionsMiddleware =
    (
        permissions: Permission | Permission[],
        options?: CheckPermissionsOptions,
    ): RequestHandler =>
    async (req, res, next) => {
        if (!(await verifyPermissions(req, res, permissions, options))) {
            return;
        }

        next();
    };
