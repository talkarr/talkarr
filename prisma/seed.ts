import argon2 from 'argon2';
import { execSync } from 'node:child_process';
import waitOn from 'wait-on';

import { markRootFolder } from '@backend/fs';
import { createUserPermissions, Permission } from '@backend/permissions';

import { PrismaClient } from '@prisma/client';

waitOn({
    resources: ['tcp:5432'],
    timeout: 60_000,
})
    .then(async () => {
        console.log('Postgres is up');
    })
    .catch(async error => {
        console.error(error);
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

    const skipUserCreation = process.env.SKIP_USER_CREATION === '1';

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

        if (skipUserCreation) {
            console.log('Skipping user creation as SKIP_USER_CREATION is set');
        } else {
            console.log('Creating test user');
            await prisma.user.create({
                data: {
                    displayName: 'Test User',
                    email: 'test@example.com',
                    password: await argon2.hash('Passwort_123'),
                    permissions: {
                        create: createUserPermissions(Permission.Admin).map(
                            permission => ({ permission }),
                        ),
                    },
                },
            });
        }
    }
}

main()
    .then(async () => {
        console.log('Successfully seeded database');
    })
    .catch(async error => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
