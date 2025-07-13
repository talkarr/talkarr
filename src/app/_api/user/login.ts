import type { RequestBody } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

export type UserLoginBody = RequestBody<'/user/login'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pLoginUser = async (body: UserLoginBody) => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.POST('/user/login', {
        body,
        headers: {
            cookie,
        },
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type LoginUserResponse =
    | Awaited<ReturnType<typeof pLoginUser>>
    | undefined;

export const loginUser: (body: UserLoginBody) => Promise<LoginUserResponse> =
    pLoginUser;
