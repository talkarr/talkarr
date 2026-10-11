import type { RequestBody } from '@backend/types';

import api, { wrapApiCall } from '@/utils/api';

export type UserLoginBody = RequestBody<'/user/login'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pLoginUser = async (body: UserLoginBody) => {
    const { data, error, response } = await api.POST('/user/login', {
        body,
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
    wrapApiCall(pLoginUser);
