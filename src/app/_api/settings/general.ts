import type { RequestBody } from '@backend/types';

import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetGeneralSettings = async () => {
    const { data, error, response } = await api.GET('/settings/general/config');

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
    const { data, error, response } = await api.POST(
        '/settings/general/config',
        { body },
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
