'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import LogoImage from '@/app/icon.svg';

import Box from '@mui/material/Box';

export interface LogoProps {
    width?: number;
    height?: number;
}

const Logo: FC<LogoProps> = ({ width = 100, height = 100 }) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width,
                height,
            }}
        >
            <LogoImage
                width={width}
                height={height}
                style={{ width, height }}
                alt={t('application.name')}
            />
        </Box>
    );
};

export default Logo;
