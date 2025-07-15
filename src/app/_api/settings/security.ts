import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListUsers = async () => {
    const cookie = await getCookiesForApi();

    const { data, error, response } = await api.GET(
        '/settings/security/users',
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

export type ListUsersResponse =
    | Awaited<ReturnType<typeof pListUsers>>
    | undefined;

export const listUsers: () => Promise<ListUsersResponse> = pListUsers;
