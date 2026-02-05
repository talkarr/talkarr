import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma-generated/client';

type ExternalPrisma = PrismaClient & {
    $disconnect: never; // ensure nobody calls $disconnect
};

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const internalPrisma = new PrismaClient({
    adapter,
});

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
