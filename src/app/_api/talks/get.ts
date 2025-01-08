import type { RequestParams } from '@backend/types';

import api from '@/utils/api';

export type GetTalkParams = RequestParams<'/talks/get'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetTalk = async (query: GetTalkParams) => {
    const { data, error, response } = await api.GET('/talks/get', {
        params: {
            query,
        },
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetTalkResponse = Awaited<ReturnType<typeof pGetTalk>> | undefined;

export const getTalk: (query: GetTalkParams) => Promise<GetTalkResponse> =
    pGetTalk;
