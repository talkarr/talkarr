import { PrismaClient } from '@prisma/client';

type ExternalPrisma = PrismaClient & {
    $disconnect: never; // ensure nobody calls $disconnect
};

const internalPrisma = new PrismaClient();

const prisma: ExternalPrisma = internalPrisma as ExternalPrisma;

export default { prisma };

export { prisma };

export const isDatabaseConnected = async (): Promise<boolean> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch {
        return false;
    }
};
