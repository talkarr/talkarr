import type { RequestParams } from '@backend/types';

import { getCookiesForApi } from '@/app/_api';

import api from '@/utils/api';

export type TalksInfoParams = RequestParams<'/talks/info'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pTalkInfo = async (query: TalksInfoParams) => {
    const cookie = await getCookiesForApi();
    const { data, error, response } = await api.GET('/talks/info', {
        params: {
            query,
        },
        headers: {
            cookie,
        },
        cache: 'no-store',
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type TalkInfoResponse =
    | Awaited<ReturnType<typeof pTalkInfo>>
    | undefined;

export const talkInfo: (query: TalksInfoParams) => Promise<TalkInfoResponse> =
    pTalkInfo;
