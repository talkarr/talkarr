import type { RequestParams } from '@backend/types';

import api, { wrapApiCall } from '@/utils/api';

export type TalksListParams = RequestParams<'/talks/list'>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListEvents = async (query: TalksListParams) => {
    const { data, error, response } = await api.GET('/talks/list', {
        params: {
            query,
        },
        cache: 'no-store',
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type ListEventsResponse =
    | Awaited<ReturnType<typeof pListEvents>>
    | undefined;

export const listEvents: (
    query: TalksListParams,
) => Promise<ListEventsResponse> = wrapApiCall(pListEvents);

export const defaultListEventsParams: TalksListParams = {
    page: 1,
    limit: 48,
};
