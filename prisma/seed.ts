import { execSync } from 'child_process';
import waitOn from 'wait-on';

import { PrismaClient } from '@prisma/client';

waitOn({
    resources: ['tcp:5432'],
    timeout: 60000,
})
    .then(async () => {
        console.log('Postgres is up');
    })
    .catch(async e => {
        console.error(e);
        process.exit(1);
    });

// run prisma db push
const buf = execSync('prisma db push --skip-generate');
console.log(buf.toString());

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
        console.log('Successfully seeded database');
    })
    .catch(async e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
