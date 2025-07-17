import { execSync } from 'child_process';
import waitOn from 'wait-on';
import argon2 from 'argon2';

import { PrismaClient } from '@prisma/client';
import { markRootFolder } from '@backend/fs';

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

async function main(): Promise<void> {
    const applyLaptopPreset =
        !process.env.CI &&
        process.env.NODE_ENV !== 'test' &&
        process.env.APPLY_PRESET === '1';

    if (applyLaptopPreset) {
        console.log('Populating root folder');
        const path = '/Users/ccomm/Movies/talkarr';

        await markRootFolder({
            rootFolderPath: path,
        });

        await prisma.rootFolder.create({
            data: {
                path,
                marked: true,
            },
        });

        await prisma.user.create({
            data: {
                displayName: 'Test User',
                email: 'test@example.com',
                password: await argon2.hash('Passwort_123'),
                permissions: {
                    create: {
                        permission: 'Admin',
                    },
                },
            },
        });
    }
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
