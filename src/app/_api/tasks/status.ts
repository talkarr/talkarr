import api from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pGetTaskStatus = async () => {
    const { data, error, response } = await api.GET('/tasks/status', {
        cache: 'no-cache',
    });

    if (error) {
        return { ...error, response };
    }

    return data;
};

export type GetTaskStatusResponse =
    | Awaited<ReturnType<typeof pGetTaskStatus>>
    | undefined;

export const getTaskStatus: () => Promise<GetTaskStatusResponse> =
    pGetTaskStatus;
