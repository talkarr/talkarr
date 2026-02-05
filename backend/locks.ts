import type { Locks } from '@prisma-generated/client';

import { prisma } from '@backend/prisma';
import rootLog from '@backend/root-log';

import { Prisma } from '@prisma-generated/client';

const log = rootLog.child({ label: 'locks' });

export const acquireLock = async (data: Locks): Promise<void> => {
    try {
        await prisma.locks.create({
            data,
        });
        log.debug('Lock acquired', { lock: data.name });
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
        log.debug('Lock acquired', { lock: data.name });
        return true;
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            log.debug('Lock already acquired', { lock: data.name });
            return false;
        }
        return false;
    }
};

// Returns false if timeout was hit
export const acquireLockOrWait = async (
    data: Locks,
    timeoutMs = 5000,
): Promise<boolean> =>
    new Promise(resolve => {
        let checkInterval: NodeJS.Timeout | null = null;
        let timeout: NodeJS.Timeout | null = null;

        const resolveProxy = (returnValue: boolean): void => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }

            if (checkInterval !== null) {
                clearInterval(checkInterval);
            }

            resolve(returnValue);
        };

        checkInterval = setInterval(async () => {
            const locked = await acquireLockAndReturn(data);

            if (locked) {
                resolveProxy(true);
            }
        }, 100);

        timeout = setTimeout(() => {
            timeout = null;
            resolveProxy(false);
        }, timeoutMs);
    });

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
        log.debug('Lock released', { lock: data.name });
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
