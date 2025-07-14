import type { RequestBody } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

export type RegisterInitialUserBody = RequestBody<'/user/register-initial'>;

const pRegisterInitialUser = async (
    body: RegisterInitialUserBody,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.POST('/user/register-initial', {
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

export type RegisterInitialUserResponse =
    | Awaited<ReturnType<typeof pRegisterInitialUser>>
    | undefined;

export const registerInitialUser: (
    body: RegisterInitialUserBody,
) => Promise<RegisterInitialUserResponse> = pRegisterInitialUser;
