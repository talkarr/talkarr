import type { FC } from 'react';

import type { SuccessData } from '@backend/types';

import MediaItem from '@components/YourMediaGrid/MediaItem';
import { Grid2 } from '@mui/material';

export interface YourMediaGridProps {
    initialData: SuccessData<'/talks/list', 'get'>;
}

const YourMediaGrid: FC<YourMediaGridProps> = ({ initialData }) => (
    <Grid2 container spacing={2}>
        {initialData.map(talk => (
            <MediaItem key={talk.guid} talk={talk} />
        ))}
    </Grid2>
);

export default YourMediaGrid;
