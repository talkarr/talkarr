// noinspection JSUnusedGlobalSymbols

import type { UserPreferences as CodeUserPreferences } from '@backend/user-preferences';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace PrismaJson {
        type UserPreferences = CodeUserPreferences;
    }
}
