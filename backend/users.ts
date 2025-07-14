import type { Permission, User as DbUser } from '@prisma/client';
import type express from 'express';
import type { Algorithm } from 'jsonwebtoken';

import argon2 from 'argon2';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import { generateIdenticonDataUrl } from 'simple-identicon';

import { serverSecret } from '@backend/env';
import type { components } from '@backend/generated/schema';
import { prisma } from '@backend/prisma';
import rootLog from '@backend/rootLog';
import { getSettings } from '@backend/settings';
import type { ExpressResponse } from '@backend/types';

export const jwtAlgorithm: Algorithm = 'HS512';
export const tokenCookieName = 'talkarr_token';
export const jwtIssuer = 'talkarr';

type SchemaUser = components['schemas']['User'];

const log = rootLog.child({ label: 'user' });

export interface UserWithPassword extends SchemaUser {
    password: string;
}

const libravatarBaseUrl = 'https://seccdn.libravatar.org/';

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
            }) as components['schemas']['User'],
    );

    return Promise.all(promises);
};

export const getUserWithPasswordByEmail = async (
    email: string,
): Promise<UserWithPassword | null> => {
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
    };
};

export const getUserWithPasswordById = async (
    id: components['schemas']['User']['id'],
): Promise<UserWithPassword | null> => {
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
                    permission: 'Admin',
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

        log.info(
            `Validating user cookie: ${token ? 'present' : 'not present'}`,
        );

        if (!token) {
            log.info('No user token found in cookies');
            return null;
        }

        try {
            const decoded = jwt.verify(token, serverSecret, {
                algorithms: [jwtAlgorithm],
                issuer: jwtIssuer,
            }) as { id: components['schemas']['User']['id'] };

            log.info(
                `User token decoded successfully for user ID: ${decoded.id}`,
            );

            return await getUserWithPasswordById(decoded.id);
        } catch (error) {
            console.error('Invalid token:', error);
            return null;
        }
    } catch (error) {
        console.error('Error validating user cookie:', error);
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

export const verifyPassword = async (
    user: UserWithPassword,
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
            permissions: {
                create: {
                    permission: 'Admin',
                },
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
    initialPermissions = [],
}: {
    email: string;
    password: string;
    displayName: string;
    initialPermissions: Permission[];
}): Promise<DbUser> => {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: passwordHash,
            displayName,
            ...(initialPermissions.length > 0
                ? {
                      permissions: {
                          create: initialPermissions.map(permission => ({
                              permission,
                          })),
                      },
                  }
                : {}),
        },
    });

    log.info(`User created with ID: ${user.id}`);

    return user;
};
