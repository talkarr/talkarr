import type { Metadata, NextPage } from 'next';

import type { SuccessData } from '@backend/types';

import { getTaskStatus } from '@/app/_api/tasks/status';
import TaskList from '@/app/(i18n)/(authenticated)/settings/tasks/_components/TaskList';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
    title: 'Tasks',
};

export type TasksData = SuccessData<'/tasks/status', 'get'>;

const Page: NextPage = async () => {
    const tasks = await getTaskStatus();

    const tasksData = tasks?.success ? tasks.data : null;

    return (
        <Box data-testid="task-settings">
            <Box>
                <Box mb={2}>
                    <Typography variant="h4">Tasks</Typography>
                </Box>
                {tasksData ? (
                    <TaskList initialData={tasksData} />
                ) : (
                    <Box>
                        <Typography variant="body1">
                            No tasks currently running or an error occurred.
                        </Typography>
                        <Typography variant="body2">
                            {!tasks?.success && tasks?.error
                                ? `Error: ${tasks.error}`
                                : 'Please try again later.'}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Page;
