import type { Locks } from '@prisma/client';

import { prisma } from '@backend/prisma';

import { Prisma } from '@prisma/client';

export const acquireLock = async (data: Locks): Promise<void> => {
    try {
        await prisma.locks.create({
            data,
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new Error('Lock already acquired');
        }

        throw error;
    }
};

export const acquireLockAndReturn = async (data: Locks): Promise<boolean> => {
    try {
        await prisma.locks.create({
            data,
        });

        return true;
    } catch {
        return false;
    }
};

export const releaseLock = async (
    data: Locks,
    throwIfNotFound = true,
): Promise<void> => {
    try {
        await prisma.locks.delete({
            where: {
                name: data.name,
            },
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            if (!throwIfNotFound) {
                return;
            }

            throw new Error('Lock not found');
        }

        throw error;
    }
};

export const isLocked = async (data: Locks): Promise<boolean> => {
    const lock = await prisma.locks.findUnique({
        where: {
            name: data.name,
        },
    });

    return !!lock;
};

export const releaseAllLocks = async (): Promise<void> => {
    await prisma.locks.deleteMany({
        where: {
            name: {
                not: 'docker',
            },
        },
    });
};
