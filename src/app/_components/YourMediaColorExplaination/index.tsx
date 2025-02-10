'use client';

import type { FC } from 'react';

import {
    getMediaItemStatusColor,
    MediaItemStatus,
} from '@components/YourMediaGrid/MediaItem';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const YourMediaColorExplanation: FC = () => {
    const theme = useTheme();

    const colors = getMediaItemStatusColor(theme);

    const textMap: Record<MediaItemStatus, string> = {
        [MediaItemStatus.Downloaded]: 'Downloaded videos',
        [MediaItemStatus.Missing]: 'Missing videos',
        [MediaItemStatus.Downloading]: 'Downloading files',
        [MediaItemStatus.Problem]: 'Problem with event',
    };

    return (
        <Box display="flex" flexDirection="column" mt={2}>
            {Object.entries(colors).map(([status, color]) => (
                <Box key={status} display="flex" alignItems="center" gap={1}>
                    <Box
                        sx={{
                            width: 24,
                            height: 12,
                            borderRadius: 1,
                            backgroundColor: color as string,
                        }}
                    />
                    <Typography sx={{ color }}>
                        {textMap[status as unknown as MediaItemStatus]}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default YourMediaColorExplanation;
