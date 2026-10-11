import api, { wrapApiCall } from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pBasicListEvents = async () => {
    const { data, error, response } = await api.GET('/talks/basic-list', {
        cache: 'no-store',
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type BasicListEventsResponse =
    | Awaited<ReturnType<typeof pBasicListEvents>>
    | undefined;

export const basicListEvents: () => Promise<BasicListEventsResponse> =
    wrapApiCall(pBasicListEvents);
