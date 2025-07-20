import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetAppStatus = async () => {
    const { data, error, response } = await api.GET('/status');

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetAppStatusResponse =
    | Awaited<ReturnType<typeof pGetAppStatus>>
    | undefined;

export const getAppStatus: () => Promise<GetAppStatusResponse> = pGetAppStatus;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetInformation = async () => {
    const { data, error, response } = await api.GET('/information');

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetInformationResponse =
    | Awaited<ReturnType<typeof pGetInformation>>
    | undefined;

export const getInformation: () => Promise<GetInformationResponse> =
    pGetInformation;
