import { PrismaClient } from '@prisma/client';

type ExternalPrisma = PrismaClient & {
    $disconnect: never; // ensure nobody calls $disconnect
};

const internalPrisma = new PrismaClient();

const prisma: ExternalPrisma = internalPrisma as ExternalPrisma;

export default { prisma };

export { prisma };
