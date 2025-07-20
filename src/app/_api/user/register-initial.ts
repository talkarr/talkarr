import type { RequestBody } from '@backend/types';

import api from '@/utils/api';

export type RegisterInitialUserBody = RequestBody<'/user/register-initial'>;

const pRegisterInitialUser = async (
    body: RegisterInitialUserBody,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
    const { data, error, response } = await api.POST('/user/register-initial', {
        body,
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
