// noinspection JSUnusedGlobalSymbols

import type { UserPreferences as CodeUserPreferences } from '@backend/users';

declare global {
    namespace PrismaJson {
        type UserPreferences = CodeUserPreferences;
    }
}
