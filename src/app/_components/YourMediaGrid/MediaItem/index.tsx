'use client';

import Image from 'next/image';

import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import moment from 'moment';

import { getMediaItemStatusColor } from '@backend/talkUtils';
import type { SuccessData } from '@backend/types';

import useOnScreen from '@/hooks/useOnScreen';

import { longDateFormat, specificTalkPageLink } from '@/constants';
import { useApiStore } from '@/providers/apiStoreProvider';

import CircularProgressWithLabel from '@components/CircularProgressWithLabel';
import InvisibleLink from '@components/InvisibleLink';
import ProblemIcon from '@mui/icons-material/ReportProblem';
import { styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export interface MediaItemProps {
    initialData: SuccessData<'/talks/list', 'get'>['events'][0];
}

const StyledContainer = styled(Grid)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 3,
    overflow: 'hidden',
}));

const MediaItem: FC<MediaItemProps> = ({ initialData }) => {
    const theme = useTheme();

    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const getTalkInfo = useApiStore(state => state.getTalkInfo);

    const isVisible = useOnScreen(containerRef);

    const talkInfo = useApiStore(state => {
        if (initialData.guid in state.talkInfo) {
            const res = state.talkInfo[initialData.guid];

            if (res?.success) {
                return res.data;
            }

            return null;
        }

        return null;
    });

    useEffect(() => {
        const func = async (): Promise<void> => {
            await getTalkInfo(initialData.guid);
        };

        const intervalMs = initialData.has_problems?.length
            ? 20000
            : talkInfo?.is_downloading
              ? 1000
              : 5000;

        const interval = isVisible ? setInterval(func, intervalMs) : null;

        if (isVisible) {
            func();
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [
        getTalkInfo,
        isVisible,
        initialData.guid,
        initialData.has_problems?.length,
        initialData.title,
        talkInfo?.is_downloading,
    ]);

    const status = useMemo(() => {
        if (!talkInfo) {
            if (initialData.status !== null) {
                return initialData.status;
            }

            return null;
        }

        return talkInfo.status;
    }, [initialData.status, talkInfo]);

    return (
        <StyledContainer
            size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
            ref={containerRef}
            data-media-item-slug={initialData.slug}
            data-testid="media-item"
        >
            <Card
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <InvisibleLink
                    href={specificTalkPageLink(initialData.slug)}
                    style={{ flex: 1 }}
                    tabIndex={-1}
                >
                    <CardActionArea sx={{ height: '100%' }}>
                        <Box
                            height="100%"
                            sx={{
                                ...(status !== null
                                    ? {
                                          borderBottomColor:
                                              getMediaItemStatusColor(theme)[
                                                  status
                                              ],
                                          borderBottomWidth: 4,
                                          borderBottomStyle: 'solid',
                                      }
                                    : {}),
                            }}
                        >
                            <CardMedia>
                                {imageLoaded ? null : (
                                    <Skeleton
                                        variant="rectangular"
                                        animation="wave"
                                        sx={{
                                            aspectRatio: '16/9',
                                            width: '100%',
                                            height: 'auto',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            borderRadius: 3,
                                        }}
                                    />
                                )}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        aspectRatio: '16/9',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: 1,
                                    }}
                                >
                                    <Image
                                        src={initialData.poster_url}
                                        fill
                                        style={{
                                            objectFit: 'cover',
                                        }}
                                        alt={initialData.title}
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </Box>
                            </CardMedia>
                            <CardHeader
                                title={initialData.title}
                                subheader={`${moment(initialData.date).format(longDateFormat)} - ${initialData.conference.title}`}
                            />
                        </Box>
                    </CardActionArea>
                </InvisibleLink>
                {initialData.has_problems?.length ? (
                    <Box
                        sx={{
                            borderBottomLeftRadius: 8,
                            userSelect: 'none',
                        }}
                        bgcolor="common.white"
                        position="absolute"
                        top={0}
                        right={0}
                        boxShadow={1}
                    >
                        <Tooltip
                            title={initialData.has_problems.join(', ') || ''}
                            arrow
                            placement="top"
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                p={0.5}
                            >
                                <Typography variant="caption" color="error">
                                    Problem
                                </Typography>
                                <ProblemIcon color="error" fontSize="small" />
                            </Box>
                        </Tooltip>
                    </Box>
                ) : talkInfo?.is_downloading ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            p: 1,
                        }}
                    >
                        <CircularProgressWithLabel
                            value={talkInfo.download_progress}
                            backgroundColor="rgb(42, 42, 42)"
                        />
                    </Box>
                ) : null}
            </Card>
        </StyledContainer>
    );
};

export default MediaItem;
