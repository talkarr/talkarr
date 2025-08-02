'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface ImageFallbackProps {
    width?: number;
    height?: number;
}

const ImageFallback: FC<ImageFallbackProps> = ({ width, height }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: width || '100%',
                height: height || '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.200',
                ...theme.applyStyles('dark', {
                    backgroundColor: 'grey.700',
                }),
            }}
        >
            <Typography variant="h4" fontWeight="normal">
                {t('components.imageFallback.noImageAvailable')}
            </Typography>
            <Typography variant="body1" fontWeight="normal">
                {t('components.imageFallback.noImageAvailableDescription')}
            </Typography>
        </Box>
    );
};

export default ImageFallback;
