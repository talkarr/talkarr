import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pListEvents = async () => {
    const { data, error, response } = await api.GET('/talks/list', {
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

export const listEvents: () => Promise<ListEventsResponse> = pListEvents;
