import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetUserInfo = async () => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.GET('/user/info', {
        cache: 'no-store',
        headers: {
            cookie,
        },
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetUserInfoResponse =
    | Awaited<ReturnType<typeof pGetUserInfo>>
    | undefined;

export const getUserInfo: () => Promise<GetUserInfoResponse> = pGetUserInfo;
