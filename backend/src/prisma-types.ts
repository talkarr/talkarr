// noinspection JSUnusedGlobalSymbols

import type { UserPreferences as CodeUserPreferences } from '@backend/user-preferences';

declare global {
    namespace PrismaJson {
        type UserPreferences = CodeUserPreferences;
    }
}
