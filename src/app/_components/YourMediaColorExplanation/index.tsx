'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MediaItemStatus } from '@backend/talk-utils';
import {
    generateStatusMap,
    getMediaItemStatusColor,
} from '@backend/talk-utils';
import type { SuccessData, SuccessResponse } from '@backend/types';

import { useApiStore } from '@/providers/api-store-provider';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface YourMediaColorExplanationProps {
    initialStatusCount: SuccessData<'/talks/list', 'get'>['statusCount'];
    initialData: SuccessData<'/talks/list', 'get'>['events'];
}

const YourMediaColorExplanation: FC<YourMediaColorExplanationProps> = ({
    initialStatusCount,
    initialData,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const colors = getMediaItemStatusColor(theme);

    const talkInfoMap = useApiStore(state => state.talkInfo);

    const updatedStatusCount = useMemo(() => {
        const initial = initialData.map(({ status, guid }) => ({
            status: status as MediaItemStatus,
            key: guid,
        }));

        const updated = (
            Object.entries(talkInfoMap).filter(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_, talk]) => talk?.success,
            ) as [string, SuccessResponse<'/talks/info', 'get'>][]
        ).map(([key, { data }]) => ({
            status: data.status,
            key,
        }));

        if (updated.length === 0) {
            return generateStatusMap(initial);
        }

        const merged: Record<string, MediaItemStatus | null> = {};

        for (const { status, key } of initial) {
            merged[key] = status;
        }

        for (const { status, key } of updated) {
            merged[key] = status as MediaItemStatus | null;
        }

        return generateStatusMap(
            Object.entries(merged).map(([key, status]) => ({
                status,
                key,
            })),
        );
    }, [initialData, talkInfoMap]);

    const statusCount = { ...initialStatusCount, ...updatedStatusCount };

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
                                statusCount[
                                    statusElement as keyof typeof statusCount
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
                    {initialData.length}
                </Typography>
            </Box>
        </>
    );
};

export default YourMediaColorExplanation;
