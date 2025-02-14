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
}

const YourMediaColorExplanation: FC<YourMediaColorExplanationProps> = ({
    initialStatusCount,
}) => {
    const theme = useTheme();

    const colors = getMediaItemStatusColor(theme);

    const talkInfoMap = useApiStore(state => state.talkInfo);

    const updatedStatusCount = useMemo(
        () =>
            generateStatusMap(
                Object.values(talkInfoMap)
                    .map(data =>
                        data?.success ? { status: data.data.status } : null,
                    )
                    .filter(Boolean) as Array<{ status: MediaItemStatus }>,
            ),
        [talkInfoMap],
    );

    const statusCount = { ...initialStatusCount, ...updatedStatusCount };

    return (
        <Box display="flex" flexDirection="column" mt={2}>
            {Object.entries(colors).map(([statusElement, color]) => (
                <Box
                    key={statusElement}
                    display="flex"
                    alignItems="center"
                    gap={1}
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
                        {statusCount[statusElement as keyof typeof statusCount]}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default YourMediaColorExplanation;
