'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { getMediaItemStatusColor } from '@backend/talk-utils';
import type { SuccessData } from '@backend/types';

export interface YourMediaColorExplanationProps {
    initialData: SuccessData<'/talks/list', 'get'>;
}

const YourMediaColorExplanation: FC<YourMediaColorExplanationProps> = ({
    initialData,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const colors = getMediaItemStatusColor(theme);

    const initialStatusCount = initialData.statusCount;

    return (
        <>
            <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                gap={{ xs: 0.5, lg: 2 }}
                mt={2}
            >
                {Object.entries(colors).map(([statusElement, color]) => (
                    <Box
                        key={statusElement}
                        display="flex"
                        alignItems="center"
                        gap={0.5}
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
                            {t(`enums.mediaItemStatus.${statusElement}`)}:{' '}
                            {
                                initialStatusCount[
                                    statusElement as keyof typeof initialStatusCount
                                ]
                            }
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                mt={0.5}
                sx={{ color: theme.palette.text.secondary }}
            >
                <Box
                    sx={{
                        width: 24,
                        height: 12,
                        borderRadius: 1,
                        backgroundColor: theme.palette.text.secondary,
                    }}
                />
                <Typography>
                    {t('components.yourMediaColorExplanation.totalEvents')}:{' '}
                    {initialData.total}
                </Typography>
            </Box>
        </>
    );
};

export default YourMediaColorExplanation;
