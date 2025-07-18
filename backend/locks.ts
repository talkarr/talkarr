import type { Locks } from '@prisma/client';

import { prisma } from '@backend/prisma';
import rootLog from '@backend/rootLog';

import { Prisma } from '@prisma/client';

const log = rootLog.child({ label: 'locks' });

export const acquireLock = async (data: Locks): Promise<void> => {
    try {
        await prisma.locks.create({
            data,
        });
        log.info('Lock acquired', { lock: data.name });
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
        log.info('Lock acquired', { lock: data.name });
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
        log.info('Lock released', { lock: data.name });
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

export const releaseAllLocks = async (): Promise<number> => {
    const res = await prisma.locks.deleteMany({});
    log.info('All locks released', { count: res.count });

    return res.count;
};
