import type { RequestBody } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetGeneralSettings = async () => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.GET(
        '/settings/general/config',
        {
            cache: 'no-store',
            headers: {
                cookie,
            },
        },
    );

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetGeneralSettingsResponse =
    | Awaited<ReturnType<typeof pGetGeneralSettings>>
    | undefined;

export const getGeneralSettings: () => Promise<GetGeneralSettingsResponse> =
    pGetGeneralSettings;

export type SetGeneralSettingsParams = RequestBody<'/settings/general/config'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pSetGeneralSettings = async (body: SetGeneralSettingsParams) => {
    const cookie = await getCookiesForApi();
    const { data, error, response } = await api.POST(
        '/settings/general/config',
        {
            body,
            headers: {
                cookie,
            },
        },
    );

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type SetGeneralSettingsResponse =
    | Awaited<ReturnType<typeof pSetGeneralSettings>>
    | undefined;

export const setGeneralSettings: (
    body: SetGeneralSettingsParams,
) => Promise<SetGeneralSettingsResponse> = pSetGeneralSettings;
