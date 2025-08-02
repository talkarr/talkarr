'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AppNotAvailable: FC = () => {
    const { t } = useTranslation();

    return (
        <Box>
            <Typography>
                {t('components.appNotAvailable.applicationNotAvailable')}
            </Typography>
        </Box>
    );
};

export default AppNotAvailable;
