import type { FC } from 'react';

import Grid from '@mui/material/Grid';

import type { SuccessData } from '@backend/types';

import MediaItem from '@components/YourMediaGrid/MediaItem';

export interface YourMediaGridProps {
    initialData: SuccessData<'/talks/list', 'get'>['events'];
}

const YourMediaGrid: FC<YourMediaGridProps> = ({ initialData }) => (
    <Grid container spacing={2}>
        {initialData.map(talk => (
            <MediaItem key={talk.guid} initialData={talk} />
        ))}
    </Grid>
);

export default YourMediaGrid;
