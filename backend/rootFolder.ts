import { Prisma, PrismaClient } from '@prisma/client';

export enum AddRootFolderResponse {
    Success,
    Duplicate,
    Other,
}

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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return AddRootFolderResponse.Duplicate;
            }
        }

        return AddRootFolderResponse.Other;
    }

    return AddRootFolderResponse.Success;
};

export const listRootFolders = async (): Promise<string[]> => {
    const prisma = new PrismaClient();

    try {
        const rootFolders = await prisma.rootFolder.findMany();

        return rootFolders.map(folder => folder.path);
    } catch {
        return [];
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteRootFolder = async (
    rootFolder: string,
): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.rootFolder.delete({
            where: {
                path: rootFolder,
            },
            include: {
                events: true,
            },
        });
    } catch {
        return false;
    }

    return true;
};
