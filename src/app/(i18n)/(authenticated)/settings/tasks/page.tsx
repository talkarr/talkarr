import type { Metadata, NextPage } from 'next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { SuccessData } from '@backend/types';

import { getTaskStatus } from '@/app/_api/tasks/status';
import TaskList from '@/app/(i18n)/(authenticated)/settings/tasks/_components/TaskList';

import { getServerSideTranslation } from '@/i18n/server-side';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.taskSettingsPage.title'),
    };
};

export type TasksData = SuccessData<'/tasks/status', 'get'>;

const Page: NextPage = async () => {
    const { t } = await getServerSideTranslation();

    const tasks = await getTaskStatus();

    const tasksData = tasks?.success ? tasks.data : null;

    return (
        <Box data-testid="task-settings">
            <Box>
                <Box mb={2}>
                    <Typography variant="h4">
                        {t('pages.taskSettingsPage.title')}
                    </Typography>
                </Box>
                {tasksData ? (
                    <TaskList initialData={tasksData} />
                ) : (
                    <Box>
                        <Typography variant="body1">
                            {t('pages.taskSettingsPage.noTasksRunning')}
                        </Typography>
                        <Typography variant="body2">
                            {!tasks?.success && tasks?.error
                                ? `Error: ${tasks.error}`
                                : t('pages.taskSettingsPage.pleaseTryAgain')}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Page;
