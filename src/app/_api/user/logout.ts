import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pLogoutUser = async () => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.POST('/user/logout', {
        headers: {
            cookie,
        },
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type LogoutUserResponse =
    | Awaited<ReturnType<typeof pLogoutUser>>
    | undefined;

export const logoutUser: () => Promise<LogoutUserResponse> = pLogoutUser;
