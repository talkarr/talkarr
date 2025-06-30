import type { User as DbUser } from '@prisma/client';

import gravatar from 'gravatar';
import { generateIdenticonDataUrl } from 'simple-identicon';

import type { components } from '@backend/generated/schema';
import { prisma } from '@backend/prisma';
import { getSettings } from '@backend/settings';

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
