import type { RootFolder } from '@prisma/client';

import rootLog from '@backend/rootLog';
import { deleteTalk } from '@backend/talks';

import { Prisma, PrismaClient } from '@prisma/client';

export enum AddRootFolderResponse {
    Success,
    Duplicate,
    Other,
}

const log = rootLog.child({ label: 'rootFolder' });

export const addRootFolder = async (
    rootFolder: string,
): Promise<AddRootFolderResponse> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.create({
            data: {
                path: rootFolder,
            },
        });
    } catch (error) {
        log.error('Error adding root folder', { error, rootFolder });
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return AddRootFolderResponse.Duplicate;
            }
        }

        return AddRootFolderResponse.Other;
    }

    return AddRootFolderResponse.Success;
};

export const listRootFolders = async (): Promise<RootFolder[]> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.rootFolder.findMany();
    } catch (e) {
        log.error('Error listing root folders', { error: e });
        return [];
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteRootFolder = async (
    rootFolder: string,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    const events = await prisma.event.findMany({
        where: {
            root_folder: {
                path: rootFolder,
            },
        },
    });

    if (events.length > 0) {
        const promises = events.map(event =>
            deleteTalk(event.guid, { deleteFiles: true }),
        );

        await Promise.all(promises);
    } else {
        log.info('No events found for root folder', { rootFolder });
    }

    try {
        await prisma.rootFolder.delete({
            where: {
                path: rootFolder,
            },
            include: {
                events: true,
            },
        });
    } catch (e) {
        log.error('Error deleting root folder', { error: e, rootFolder });
        return false;
    }

    return true;
};

export const setRootFolderMarked = async (
    rootFolder: string,
    marked: boolean,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.update({
            where: {
                path: rootFolder,
            },
            data: {
                marked,
            },
        });

        return true;
    } catch (e) {
        log.error('Error setting root folder marked', { error: e, rootFolder });

        return false;
    }
};

export const setRootFolderMarkExists = async (
    rootFolder: string,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.update({
            where: {
                path: rootFolder,
            },
            data: {
                did_not_find_mark: false,
            },
        });

        return true;
    } catch (e) {
        log.error('Error setting root folder mark exists', {
            error: e,
            rootFolder,
        });

        return false;
    }
};

export const clearRootFolderMark = async (
    rootFolder: string,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.update({
            where: {
                path: rootFolder,
            },
            data: {
                did_not_find_mark: true,
            },
        });

        return true;
    } catch (e) {
        log.error('Error clearing root folder mark', {
            error: e,
            rootFolder,
        });

        return false;
    }
};

export const wasMarkFoundForRootFolder = async (
    rootFolder: string,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        const folder = await prisma.rootFolder.findUnique({
            where: {
                path: rootFolder,
            },
        });

        if (!folder) {
            return false;
        }

        return !folder.did_not_find_mark;
    } catch (e) {
        log.error('Error checking if root folder has mark', { error: e });

        return false;
    }
};

export const clearAllRootFolderHasMarks = async (): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.updateMany({
            data: {
                did_not_find_mark: true,
            },
        });

        return true;
    } catch (e) {
        log.error('Error clearing all root folder has marks', { error: e });

        return false;
    }
};
