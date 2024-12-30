'use client';

import type { FC } from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface ImageFallbackProps {
    width?: number;
    height?: number;
}

const ImageFallback: FC<ImageFallbackProps> = ({ width, height }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: width || '100%',
                height: height || '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.200',
                ...theme.applyStyles('dark', {
                    backgroundColor: 'grey.700',
                }),
            }}
        >
            <Typography variant="h5" fontWeight="normal">
                No Image available
            </Typography>
        </Box>
    );
};

export default ImageFallback;
