import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pLogoutUser = async () => {
    const { data, error, response } = await api.POST('/user/logout');

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type LogoutUserResponse =
    | Awaited<ReturnType<typeof pLogoutUser>>
    | undefined;

export const logoutUser: () => Promise<LogoutUserResponse> = pLogoutUser;
