'use client';

import type { FC } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Enum } from '@backend/types';

export interface SettingsEnumDescriptionsProps {
    options: Enum<unknown>;
    translatePrefix?: string;
}

const SettingsEnumDescriptions: FC<SettingsEnumDescriptionsProps> = ({
    options,
    translatePrefix,
}) => {
    const { t } = useTranslation();

    return (
        <Box>
            {Object.entries(options).map(([key, label]) => (
                <Box key={key} mb={1}>
                    <Typography variant="body2">
                        {t(`enums.${translatePrefix}.${label}.label`)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t(`enums.${translatePrefix}.${label}.description`)}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default SettingsEnumDescriptions;
