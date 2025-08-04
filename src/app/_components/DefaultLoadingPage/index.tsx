'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const DefaultLoadingPage: FC = () => {
    const { t } = useTranslation();

    return (
        <Box
            position="fixed"
            top="50%"
            left="50%"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Box display="flex" flexDirection="column" alignItems="center">
                <CircularProgress />
                <Typography variant="h6" mt={1}>
                    {t('common.loading')}
                </Typography>
            </Box>
        </Box>
    );
};

export default DefaultLoadingPage;
