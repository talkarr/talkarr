import type { User as DbUser } from '@prisma/client';
import type express from 'express';
import type { RequestHandler } from 'express-serve-static-core';
import type { Algorithm } from 'jsonwebtoken';
import type { PartialDeep } from 'type-fest';

import argon2 from 'argon2';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import { generateIdenticonDataUrl } from 'simple-identicon';
import typia from 'typia';

import { serverSecret } from '@backend/env';
import type { components } from '@backend/generated/schema';
import { createUserPermissions, Permission } from '@backend/permissions';
import { prisma } from '@backend/prisma';
import rootLog from '@backend/root-log';
import { getSettings } from '@backend/settings';
import type { ExpressResponse } from '@backend/types';

export const jwtAlgorithm: Algorithm = 'HS512';
export const tokenCookieName = 'talkarr_token';
export const jwtIssuer = 'talkarr';

type SchemaUser = components['schemas']['User'];

const log = rootLog.child({ label: 'user' });

export interface SchemaUserWithPassword extends SchemaUser {
    password: string;
}

export interface UserPreferences {
    timezone: string;
}

export type UserPreferencesKey = keyof UserPreferences;

export const defaultUserPreferences: UserPreferences = {
    timezone: 'UTC',
};

export type UserPreferencesValidateFunction<
    T1 = keyof UserPreferences,
    T2 = UserPreferences[keyof UserPreferences],
> = (key: T1, value: T2) => boolean;

export const userPreferencesValidators: Record<
    keyof UserPreferences,
    UserPreferencesValidateFunction
> = {
    timezone: (_key, value) => !!moment.tz.zone(value),
};

export const libravatarBaseUrl = 'https://seccdn.libravatar.org/';
export const libravatarDomain = new URL(libravatarBaseUrl).hostname;

export const generateAvatarUrl = async (user: DbUser): Promise<string> => {
    const { allowLibravatar } = getSettings().general;

    if (allowLibravatar) {
        return gravatar.url(user.email, {
            cdn: libravatarBaseUrl,
            d: 'retro',
        });
    }

    return generateIdenticonDataUrl(user.email);
};

// This will not throw
export const getUsers = async (): Promise<components['schemas']['User'][]> => {
    const users = await prisma.user.findMany({
        include: {
            permissions: {
                select: {
                    permission: true,
                },
            },
        },
    });

    // If prisma users change, update this
    const promises = users.map(
        async user =>
            ({
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                permissions: user.permissions.map(p => p.permission),
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                avatarUrl: await generateAvatarUrl(user),
                preferences: user.preferences,
            }) as components['schemas']['User'],
    );

    return Promise.all(promises);
};

export const getUserWithPasswordByEmail = async (
    email: string,
): Promise<SchemaUserWithPassword | null> => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            permissions: {
                select: {
                    permission: true,
                },
            },
        },
    });

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        password: user.password, // Note: Do not expose password in API responses
        displayName: user.displayName,
        permissions: user.permissions.map(p => p.permission),
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        avatarUrl: await generateAvatarUrl(user),
        preferences: user.preferences,
    };
};

export const getUserWithPasswordById = async (
    id: components['schemas']['User']['id'],
): Promise<SchemaUserWithPassword | null> => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            permissions: {
                select: {
                    permission: true,
                },
            },
        },
    });

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        password: user.password, // Note: Do not expose password in API responses
        displayName: user.displayName,
        permissions: user.permissions.map(p => p.permission),
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        avatarUrl: await generateAvatarUrl(user),
        preferences: user.preferences,
    };
};

export const doesEmailExist = async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    return user !== null;
};

export const getUserCount = async (): Promise<number> => prisma.user.count();

export const hasAdminUsers = async (): Promise<boolean> => {
    const adminCount = await prisma.user.count({
        where: {
            permissions: {
                some: {
                    permission: Permission.Admin,
                },
            },
        },
    });

    return adminCount > 0;
};

export const setUserCookie = (
    res: ExpressResponse<'/user/login', 'post'>,
    user: components['schemas']['User'],
): void => {
    const token = jwt.sign({ id: user.id }, serverSecret, {
        algorithm: jwtAlgorithm,
        expiresIn: '7d', // Token valid for 7 days
        issuer: jwtIssuer,
    });

    res.cookie(tokenCookieName, token, {
        httpOnly: true,
        sameSite: 'strict',
        // expire in 7 days
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
};

export const clearUserCookie = (res: express.Response): void => {
    res.clearCookie(tokenCookieName, {
        httpOnly: true,
        sameSite: 'strict',
    });
};

export const validateUserCookie = async (
    req: express.Request,
): Promise<components['schemas']['User'] | null> => {
    try {
        const token = req.cookies[tokenCookieName];

        log.debug(
            `Validating user cookie: ${token ? 'present' : 'not present'}`,
        );

        if (!token) {
            log.debug('No user token found in cookies');
            return null;
        }

        try {
            const decoded = jwt.verify(token, serverSecret, {
                algorithms: [jwtAlgorithm],
                issuer: jwtIssuer,
            }) as { id: components['schemas']['User']['id'] };

            log.debug(
                `User token decoded successfully for user ID: ${decoded.id}`,
            );

            return await getUserWithPasswordById(decoded.id);
        } catch (error) {
            log.error('Invalid token:', error);
            return null;
        }
    } catch (error) {
        log.error('Error validating user cookie:', error);
        return null;
    }
};

export const userMiddleware = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
): Promise<void> => {
    const user = await validateUserCookie(req);

    if (user) {
        // Attach user to request object
        (req as any).user = user as components['schemas']['User'];
    } else {
        (req as any).user = null;
    }

    next();
};

export const requireUser = async (
    req: express.Request<any, any, any, any>,
    res: express.Response,
): Promise<boolean> => {
    if (!(req as any).user) {
        log.debug('User is not authenticated');
        res.status(401).json({
            success: false,
            error: 'User is not authenticated',
        });
        return false;
    }

    return true;
};

export const requireUserMiddleware: RequestHandler = async (req, res, next) => {
    if (!(await requireUser(req, res))) {
        return;
    }

    next();
};

export const sanitizeUser = (user: SchemaUserWithPassword): SchemaUser => ({
    id: user.id,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    permissions: user.permissions,
    displayName: user.displayName,
    isActive: user.isActive,
    updatedAt: user.updatedAt,
    preferences: user.preferences,
});

export const verifyPassword = async (
    user: SchemaUserWithPassword,
    password?: string,
): Promise<boolean> => {
    try {
        return await argon2.verify(
            user.password,
            password ?? 'nopasswordprovided',
        );
    } catch (error) {
        log.error('Password verification failed', { error });
        return false;
    }
};

export const hashPassword = async (password: string): Promise<string> => {
    try {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            hashLength: 50,
            memoryCost: 2 ** 16, // 64 MB
        });
    } catch (error) {
        log.error('Password hashing failed', { error });
        throw new Error('Failed to hash password');
    }
};

// This will automatically result in an admin account
export const createInitialUser = async ({
    email,
    unhashedPassword,
    displayName,
}: {
    email: string;
    unhashedPassword: string;
    displayName: string;
}): Promise<DbUser> => {
    // first, verify that there are no users in the database
    const userCount = await getUserCount();

    if (userCount > 0) {
        log.warn('Attempted to create initial user, but users already exist');
        throw new Error('Users already exist in the database');
    }

    const passwordHash = await hashPassword(unhashedPassword);

    const user = await prisma.user.create({
        data: {
            email,
            password: passwordHash,
            displayName,
            preferences: defaultUserPreferences,
            permissions: {
                create: createUserPermissions([Permission.Admin]).map(
                    permission => ({ permission }),
                ),
            },
        },
    });

    log.info(`Initial user created with ID: ${user.id}`);

    return user;
};

export const createUser = async ({
    email,
    password,
    displayName,
    isActive,
    initialPermissions = [],
}: {
    email: string;
    password: string;
    displayName: string;
    isActive: boolean;
    initialPermissions: Permission[];
}): Promise<DbUser> => {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: passwordHash,
            displayName,
            isActive,
            preferences: defaultUserPreferences,
            ...(initialPermissions.length > 0
                ? {
                      permissions: {
                          create: createUserPermissions(initialPermissions).map(
                              permission => ({ permission }),
                          ),
                      },
                  }
                : {}),
        },
    });

    log.info(`User created with ID: ${user.id}`);

    return user;
};

export const validateUserPreferences = (
    userPreferences: UserPreferences,
): boolean => {
    for (const preferencesKey of Object.keys(userPreferences)) {
        const key = preferencesKey as UserPreferencesKey;

        if (key in userPreferencesValidators) {
            if (!userPreferencesValidators[key](key, userPreferences[key])) {
                return false;
            }
        } else {
            log.warn(`No validator found for ${key}`);
        }
    }

    return true;
};

export const normalizeUserPreferences = (
    userPreferences: PartialDeep<UserPreferences> | Record<string, any>,
): UserPreferences => {
    const normalizedPreferences: typeof userPreferences = {
        ...userPreferences,
    };

    for (const key of Object.keys(defaultUserPreferences)) {
        if (!(key in normalizedPreferences)) {
            normalizedPreferences[key as UserPreferencesKey] =
                defaultUserPreferences[key as UserPreferencesKey];
        }
    }

    for (const preferencesKey of Object.keys(normalizedPreferences)) {
        const key = preferencesKey as UserPreferencesKey;

        if (!(key in defaultUserPreferences)) {
            delete normalizedPreferences[key];
            continue;
        }

        if (key in userPreferencesValidators) {
            if (
                !userPreferencesValidators[key](key, normalizedPreferences[key])
            ) {
                normalizedPreferences[key] = defaultUserPreferences[key];
            }
        } else {
            log.warn(`No validator found for ${key}`);
        }
    }

    const isUserPreferences = typia.is<UserPreferences>(normalizedPreferences);

    if (isUserPreferences) {
        return normalizedPreferences;
    }

    return defaultUserPreferences;
};

export const updateUserPreferences = async (
    id: components['schemas']['User']['id'],
    updatedPreferences: UserPreferences,
): Promise<DbUser> => {
    const normalizedPreferences = normalizeUserPreferences(updatedPreferences);

    return prisma.user.update({
        where: {
            id,
        },
        data: {
            preferences: normalizedPreferences,
        },
    });
};
