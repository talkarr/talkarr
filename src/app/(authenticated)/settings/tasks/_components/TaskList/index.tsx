'use client';

import type { FC } from 'react';
import { useEffect } from 'react';

import moment from 'moment';

import type { TasksData } from '@/app/(authenticated)/settings/tasks/page';

import { longDateTimeFormat } from '@/constants';
import { useApiStore } from '@/providers/api-store-provider';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export interface TaskListProps {
    initialData: TasksData;
}

const TaskList: FC<TaskListProps> = ({ initialData }) => {
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
        return <Typography>Loading...</Typography>;
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
                        </Typography>
                        <Typography variant="body2">
                            Started at:{' '}
                            {task.started_at
                                ? moment(task.started_at).format(
                                      longDateTimeFormat,
                                  )
                                : 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                            Progress: {task.progress || 'N/A'}%
                        </Typography>
                    </Box>
                </Paper>
            ))}
            {tasksData.tasks.length === 0 ? (
                <Typography>No tasks currently running.</Typography>
            ) : null}
        </Box>
    );
};

export default TaskList;
