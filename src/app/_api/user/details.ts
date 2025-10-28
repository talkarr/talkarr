import type { RequestParams } from '@backend/types';

import api, { wrapApiCall } from '@/utils/api';

export type UserDetailsParams = RequestParams<'/user/details'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetUserDetails = async (query: UserDetailsParams) => {
    const { data, error, response } = await api.GET('/user/details', {
        cache: 'no-store',
        params: {
            query,
        },
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetUserDetailsResponse =
    | Awaited<ReturnType<typeof pGetUserDetails>>
    | undefined;

export const getUserDetails: (
    query: UserDetailsParams,
) => Promise<GetUserDetailsResponse> = wrapApiCall(pGetUserDetails);
