'use client';

import type { FC } from 'react';
import { useMemo } from 'react';

import type { MediaItemStatus } from '@backend/talkUtils';
import {
    generateStatusMap,
    getMediaItemStatusColor,
    mediaItemStatusTextMap,
} from '@backend/talkUtils';
import type { SuccessData } from '@backend/types';

import { useApiStore } from '@/providers/apiStoreProvider';

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
    const theme = useTheme();

    const colors = getMediaItemStatusColor(theme);

    const talkInfoMap = useApiStore(state => state.talkInfo);

    const updatedStatusCount = useMemo(() => {
        const arr = Object.values(talkInfoMap);

        const merged = [];

        for (let i = 0; i < initialData.length; i += 1) {
            merged.push({ ...initialData[i], ...arr[i] });
        }

        return generateStatusMap(
            merged
                .map(data => (data ? { status: data.status } : null))
                .filter(Boolean) as Array<{ status: MediaItemStatus }>,
        );
    }, [initialData, talkInfoMap]);

    const statusCount = { ...initialStatusCount, ...updatedStatusCount };

    return (
        <>
            <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                gap={2}
                mt={1}
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
                            {
                                mediaItemStatusTextMap[
                                    statusElement as unknown as MediaItemStatus
                                ]
                            }
                            :{' '}
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
                <Typography>Total events: {initialData.length}</Typography>
            </Box>
        </>
    );
};

export default YourMediaColorExplanation;
