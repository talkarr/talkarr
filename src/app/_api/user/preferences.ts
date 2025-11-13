import type { RequestBody } from '@backend/types';

import api, { wrapApiCall } from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetUserPreferences = async () => {
    const { data, error, response } = await api.GET('/user/preferences', {
        cache: 'no-store',
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetUserPreferencesResponse =
    | Awaited<ReturnType<typeof pGetUserPreferences>>
    | undefined;

export const getUserPreferences: () => Promise<GetUserPreferencesResponse> =
    wrapApiCall(pGetUserPreferences);

export type SetUserPreferencesParams = RequestBody<'/user/preferences'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pSetUserPreferences = async (body: SetUserPreferencesParams) => {
    const { data, error, response } = await api.POST('/user/preferences', {
        body,
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type SetUserPreferencesResponse =
    | Awaited<ReturnType<typeof pSetUserPreferences>>
    | undefined;

export const setUserPreferences: (
    body: SetUserPreferencesParams,
) => Promise<SetUserPreferencesResponse> = wrapApiCall(pSetUserPreferences);
