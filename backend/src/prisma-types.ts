// noinspection JSUnusedGlobalSymbols

import type { UserPreferences as CodeUserPreferences } from '@backend/src/user-preferences';

declare global {
    namespace PrismaJson {
        type UserPreferences = CodeUserPreferences;
    }
}
