'use client';

import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { TasksData } from '@/app/(i18n)/(authenticated)/settings/tasks/page';

import { longDateTimeFormat } from '@/constants';
import { useApiStore } from '@/providers/api-store-provider';

import NoSsrMoment from '@components/NoSsrMoment';

export interface TaskListProps {
    initialData: TasksData;
}

const TaskList: FC<TaskListProps> = ({ initialData }) => {
    const { t } = useTranslation();

    const taskStatus = useApiStore(store => store.taskStatus);
    const getTaskStatusData = useApiStore(store => store.getTaskStatusData);

    const tasksData = taskStatus || initialData;

    useEffect(() => {
        const interval = setInterval(
            async () => {
                await getTaskStatusData();
            },
            tasksData.tasks.length > 0 ? 5000 : 5000,
        ); // Fetch every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, [getTaskStatusData, tasksData]);

    if (!tasksData) {
        return <Typography>{t('common.loading')}</Typography>;
    }

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {tasksData.tasks.map(task => (
                <Paper key={task.id} sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="h5">{task.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {task.id}
                    </Typography>
                    <Box mt={1}>
                        <Typography variant="body1">
                            Status: {task.status}
                            {t(
                                'pages.taskSettingsPage.components.taskList.status',
                                {
                                    status: task.status,
                                },
                            )}
                        </Typography>
                        <Typography variant="body2">
                            <NoSsrMoment>
                                {moment =>
                                    t(
                                        'pages.taskSettingsPage.components.taskList.startedAt',
                                        {
                                            startedAt: task.started_at
                                                ? moment(
                                                      task.started_at,
                                                  ).format(longDateTimeFormat)
                                                : 'N/A',
                                        },
                                    )
                                }
                            </NoSsrMoment>
                        </Typography>
                        <Typography variant="body2">
                            {t(
                                'pages.taskSettingsPage.components.taskList.progress',
                                {
                                    progress: task.progress || 'N/A',
                                },
                            )}
                        </Typography>
                    </Box>
                </Paper>
            ))}
            {tasksData.tasks.length === 0 ? (
                <Typography>
                    {t(
                        'pages.taskSettingsPage.components.taskList.noTasksRunning',
                    )}
                </Typography>
            ) : null}
        </Box>
    );
};

export default TaskList;
