import moment from 'moment-timezone';

export interface UserPreferences {
    timezone: string;
}

export type UserPreferencesKey = keyof UserPreferences;

export const defaultUserPreferences: UserPreferences = {
    timezone: 'UTC',
};

export type UserPreferencesValidateFunction<
    T1 = keyof UserPreferences,
    T2 = UserPreferences[keyof UserPreferences],
> = (key: T1, value: T2) => boolean;

export const userPreferencesValidators: Record<
    keyof UserPreferences,
    UserPreferencesValidateFunction
> = {
    timezone: (_key, value) => !!moment.tz.zone(value),
};
