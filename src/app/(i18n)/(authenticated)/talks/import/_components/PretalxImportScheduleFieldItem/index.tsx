import type { FC } from 'react';
import { memo } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import VideocamOffIcon from '@mui/icons-material/VideocamOff';

import type { ScheduleEvent } from '@backend/types/schedule';

import { useUiStore } from '@/providers/ui-store-provider';

import SelectCard from '@components/SelectCard';

export interface PretalxImportScheduleFieldItemProps {
    scheduleEvent: ScheduleEvent;
    disabled: boolean;
}

const PretalxImportScheduleFieldItem: FC<
    PretalxImportScheduleFieldItemProps
> = ({ scheduleEvent, disabled }) => {
    const toggle = useUiStore(store => store.importScheduleToggleGuid);
    const selected = useUiStore(store =>
        store.importScheduleSelectedGuids.includes(scheduleEvent.guid),
    );

    const doNotRecord = scheduleEvent.do_not_record === true;

    const cardDisabled = disabled || doNotRecord;

    return (
        <Grid>
            <SelectCard
                title={scheduleEvent.title}
                headerProps={{
                    subheader: (
                        <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            gap={1}
                        >
                            <Typography gutterBottom={false}>
                                {scheduleEvent.persons
                                    .map(person => person.public_name)
                                    .join(', ')}
                            </Typography>
                            {doNotRecord ? (
                                <VideocamOffIcon color="error" />
                            ) : null}
                        </Box>
                    ),
                    sx: {
                        wordBreak: 'break-all',
                    },
                }}
                selected={selected}
                onClick={() => toggle(scheduleEvent.guid)}
                multiple
                sx={{
                    height: '100%',
                    maxHeight: 400,
                    '& .MuiCardContent-root': {
                        height: '100%',
                        maxWidth: '100%',
                        overflowX: 'hidden',
                        overflowY: 'auto',
                    },
                }}
                disabled={cardDisabled}
            >
                <Typography>{scheduleEvent.abstract}</Typography>
            </SelectCard>
        </Grid>
    );
};

export default memo(PretalxImportScheduleFieldItem);
