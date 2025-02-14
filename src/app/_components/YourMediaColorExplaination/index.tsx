'use client';

import type { FC } from 'react';

import type { MediaItemStatus } from '@backend/talkUtils';
import {
    getMediaItemStatusColor,
    mediaItemStatusTextMap,
} from '@backend/talkUtils';
import type { SuccessData } from '@backend/types';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface YourMediaColorExplanationProps {
    statusCount: SuccessData<'/talks/list', 'get'>['statusCount'];
}

const YourMediaColorExplanation: FC<YourMediaColorExplanationProps> = ({
    statusCount,
}) => {
    const theme = useTheme();

    const colors = getMediaItemStatusColor(theme);

    return (
        <Box display="flex" flexDirection="column" mt={2}>
            {Object.entries(colors).map(([statusElement, color]) => (
                <Box
                    key={statusElement}
                    display="flex"
                    alignItems="center"
                    gap={1}
                >
                    <Box
                        sx={{
                            width: 24,
                            height: 12,
                            borderRadius: 1,
                            backgroundColor: color as string,
                        }}
                    />
                    <Typography sx={{ color }}>
                        {
                            mediaItemStatusTextMap[
                                statusElement as unknown as MediaItemStatus
                            ]
                        }
                        :{' '}
                        {statusCount[statusElement as keyof typeof statusCount]}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default YourMediaColorExplanation;
