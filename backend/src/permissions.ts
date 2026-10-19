import { InvalidOptionsError } from '@backend/types/errors';
import type { SchemaUserWithPassword } from '@backend/users';

export enum Permission {
    Admin = 'Admin',
    AddEvents = 'AddEvents',
    EditEvents = 'EditEvents',
    DeleteEvents = 'DeleteEvents',
}

export interface CheckPermissionsOptions {
    compare: 'or' | 'and';
}

const defaultCheckPermissions: CheckPermissionsOptions = {
    compare: 'and',
};

export const checkPermissions = (
    userPermissions: Pick<SchemaUserWithPassword, 'permissions'>,
    permissions: Permission | Permission[],
    options: CheckPermissionsOptions = defaultCheckPermissions,
): boolean => {
    if (userPermissions.permissions.includes(Permission.Admin)) {
        return true;
    }

    const permissionsToCheck = Array.isArray(permissions)
        ? permissions
        : [permissions];

    switch (options.compare) {
        case 'or': {
            return permissionsToCheck.some(permission =>
                userPermissions.permissions.includes(permission),
            );
        }
        case 'and': {
            return permissionsToCheck.every(permission =>
                userPermissions.permissions.includes(permission),
            );
        }
        default: {
            throw new InvalidOptionsError('Invalid checkPermissions options');
        }
    }
};

export const createUserPermissions = (
    permissions: Permission | Permission[],
): string[] => {
    if (Array.isArray(permissions)) {
        return permissions;
    }

    return [permissions];
};
