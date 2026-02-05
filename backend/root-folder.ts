import type { File, RootFolder } from '@prisma-generated/client';

import { deleteTalk } from '@backend/events';
import { prisma } from '@backend/prisma';
import rootLog from '@backend/root-log';

import { Prisma } from '@prisma-generated/client';

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
            // eslint-disable-next-line unicorn/no-lonely-if
            if (error.code === 'P2002') {
                return AddRootFolderResponse.Duplicate;
            }
        }

        return AddRootFolderResponse.Other;
    }

    return AddRootFolderResponse.Success;
};

export const listRootFolders = async (): Promise<RootFolder[]> => {
    try {
        return await prisma.rootFolder.findMany();
    } catch (error) {
        log.error('Error listing root folders', { error });
        return [];
    }
};

export const listFilesForRootFolder = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<File[] | null> => {
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
    } catch (error) {
        log.error('Error listing files for root folder', {
            error,
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
    try {
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

        await prisma.rootFolder.delete({
            where: {
                path: rootFolderPath,
            },
            include: {
                events: true,
            },
        });
    } catch (error) {
        log.error('Error deleting root folder', {
            error,
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
    } catch (error) {
        log.error('Error setting root folder marked', {
            error,
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
    } catch (error) {
        log.error('Error setting root folder mark exists', {
            error,
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
    } catch (error) {
        log.error('Error clearing root folder mark', {
            error,
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
    } catch (error) {
        log.error('Error checking if root folder has mark', {
            error,
            rootFolderPath,
        });

        return false;
    }
};

export const clearAllRootFolderHasMarks = async (): Promise<boolean> => {
    try {
        await prisma.rootFolder.updateMany({
            data: {
                did_not_find_mark: true,
            },
        });

        return true;
    } catch (error) {
        log.error('Error clearing all root folder has marks', { error });

        return false;
    }
};

export const doesRootFolderExist = async ({
    rootFolderPath,
}: {
    rootFolderPath: string;
}): Promise<boolean> => {
    try {
        const folder = await prisma.rootFolder.findUnique({
            where: {
                path: rootFolderPath,
            },
        });

        return folder !== null;
    } catch (error) {
        log.error('Error checking if root folder exists', {
            error,
            rootFolderPath,
        });

        return false;
    }
};
