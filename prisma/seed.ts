import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

if (process.env.NODE_ENV !== 'development') {
    console.error('Seed script should only be run in development mode');
    process.exit(1);
}

async function main(): Promise<void> {
    // function
    await prisma.rootFolder.create({
        data: {
            path: '/Users/ccomm/Movies/talkarr',
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
