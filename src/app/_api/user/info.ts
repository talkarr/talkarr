import api, { wrapApiCall } from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetUserInfo = async () => {
    const { data, error, response } = await api.GET('/user/info', {
        cache: 'no-store',
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetUserInfoResponse =
    | Awaited<ReturnType<typeof pGetUserInfo>>
    | undefined;

export const getUserInfo: () => Promise<GetUserInfoResponse> =
    wrapApiCall(pGetUserInfo);
