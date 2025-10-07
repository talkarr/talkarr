import type { FC } from 'react';

import Grid from '@mui/material/Grid';

import type { SuccessData } from '@backend/types';

import { reportBug } from '@/utils/bug';

import MediaItem from '@components/YourMediaGrid/MediaItem';

export interface YourMediaGridProps {
    initialData: SuccessData<'/talks/list', 'get'>['events'];
    conferences: SuccessData<'/talks/list', 'get'>['conferences'];
}

const YourMediaGrid: FC<YourMediaGridProps> = ({
    initialData,
    conferences,
}) => (
    <Grid container spacing={2}>
        {initialData.map(talk => {
            const conference = conferences.find(
                conf => conf.acronym === talk.conferenceAcronym,
            );

            if (!conference) {
                // should never happen
                reportBug(
                    `Conference with acronym ${talk.conferenceAcronym} not found for talk ${talk.guid}`,
                );
                return null;
            }

            return (
                <MediaItem
                    key={talk.guid}
                    initialData={talk}
                    conference={conference}
                />
            );
        })}
    </Grid>
);

export default YourMediaGrid;
