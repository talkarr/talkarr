import type { components } from '@backend/generated/schema';
import { prisma } from '@backend/prisma';

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

    return users.map(
        user =>
            ({
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                permissions: user.permissions.map(p => p.permission),
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            }) as components['schemas']['User'],
    );
};
