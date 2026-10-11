import api, { wrapApiCall } from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListUsers = async () => {
    const { data, error, response } = await api.GET(
        '/settings/security/users',
        {
            cache: 'no-store',
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

export const listUsers: () => Promise<ListUsersResponse> =
    wrapApiCall(pListUsers);
