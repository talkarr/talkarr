import type { File, RootFolder } from '@prisma/client';

import { deleteTalk } from '@backend/events';
import rootLog from '@backend/rootLog';

import { Prisma, PrismaClient } from '@prisma/client';

export enum AddRootFolderResponse {
    Success,
    Duplicate,
    Other,
}

const log = rootLog.child({ label: 'rootFolder' });

export const addRootFolder = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<AddRootFolderResponse> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.create({
            data: {
                path: rootFolderPath,
            },
        });
    } catch (error) {
        log.error('Error adding root folder', {
            error,
            rootFolderPath,
        });
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

export const listFilesForRootFolder = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<File[] | null> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.file.findMany({
            where: {
                event: {
                    root_folder: {
                        path: rootFolderPath,
                    },
                },
            },
        });
    } catch (e) {
        log.error('Error listing files for root folder', {
            error: e,
            rootFolderPath,
        });

        return null;
    }
};

export const deleteRootFolder = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<boolean> => {
    const prisma = new PrismaClient();

    const events = await prisma.event.findMany({
        where: {
            root_folder: {
                path: rootFolderPath,
            },
        },
    });

    if (events.length > 0) {
        const promises = events.map(event =>
            deleteTalk({ guid: event.guid, deleteFiles: true }),
        );

        await Promise.all(promises);
    } else {
        log.info('No events found for root folder', {
            rootFolderPath,
        });
    }

    try {
        await prisma.rootFolder.delete({
            where: {
                path: rootFolderPath,
            },
            include: {
                events: true,
            },
        });
    } catch (e) {
        log.error('Error deleting root folder', {
            error: e,
            rootFolderPath,
        });
        return false;
    }

    return true;
};

export const setRootFolderMarked = async ({
    rootFolderPath,
    marked,
}: {
    rootFolderPath: string;
    marked: boolean;
}): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.update({
            where: {
                path: rootFolderPath,
            },
            data: {
                marked,
            },
        });

        return true;
    } catch (e) {
        log.error('Error setting root folder marked', {
            error: e,
            rootFolderPath,
        });

        return false;
    }
};

export const setRootFolderMarkExists = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.update({
            where: {
                path: rootFolderPath,
            },
            data: {
                did_not_find_mark: false,
            },
        });

        return true;
    } catch (e) {
        log.error('Error setting root folder mark exists', {
            error: e,
            rootFolderPath,
        });

        return false;
    }
};

export const clearRootFolderMark = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.update({
            where: {
                path: rootFolderPath,
            },
            data: {
                did_not_find_mark: true,
            },
        });

        return true;
    } catch (e) {
        log.error('Error clearing root folder mark', {
            error: e,
            rootFolderPath,
        });

        return false;
    }
};

export const wasMarkFoundForRootFolder = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        const folder = await prisma.rootFolder.findUnique({
            where: {
                path: rootFolderPath,
            },
        });

        if (!folder) {
            return false;
        }

        return !folder.did_not_find_mark;
    } catch (e) {
        log.error('Error checking if root folder has mark', {
            error: e,
            rootFolderPath,
        });

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
