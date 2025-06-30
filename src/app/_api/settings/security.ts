import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListUsers = async () => {
    const { data, error, response } = await api.GET('/settings/security/users');

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type ListUsersResponse =
    | Awaited<ReturnType<typeof pListUsers>>
    | undefined;

export const listUsers: () => Promise<ListUsersResponse> = pListUsers;
