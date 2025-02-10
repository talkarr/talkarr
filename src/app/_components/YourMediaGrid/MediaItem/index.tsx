'use client';

import type { Theme } from '@mui/material';
import type { Property } from 'csstype';

import Image from 'next/image';

import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import moment from 'moment';

import type { SuccessData } from '@backend/types';

import useOnScreen from '@/hooks/useOnScreen';

import { longDateFormat, specificTalkPageLink } from '@/constants';
import { useApiStore } from '@/providers/apiStoreProvider';

import CircularProgressWithLabel from '@components/CircularProgressWithLabel';
import InvisibleLink from '@components/InvisibleLink';
import ProblemIcon from '@mui/icons-material/ReportProblem';
import { Grid2, styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export interface MediaItemProps {
    talk: SuccessData<'/talks/list', 'get'>[0];
}

const StyledContainer = styled(Grid2)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
}));

export enum MediaItemStatus {
    Downloaded,
    Missing,
    Downloading,
    Problem,
}

export const getMediaItemStatusColor = (
    theme: Theme,
): Record<MediaItemStatus, string> => ({
    [MediaItemStatus.Downloaded]: theme.palette.success.main,
    [MediaItemStatus.Missing]: theme.palette.warning.main,
    [MediaItemStatus.Downloading]: theme.palette.info.main,
    [MediaItemStatus.Problem]: theme.palette.error.main,
});

const MediaItem: FC<MediaItemProps> = ({ talk }) => {
    const theme = useTheme();

    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const getTalkInfo = useApiStore(state => state.getTalkInfo);

    const isVisible = useOnScreen(containerRef);

    const talkInfo = useApiStore(state => {
        if (talk.guid in state.talkInfo) {
            const res = state.talkInfo[talk.guid];

            if (res?.success) {
                return res.data;
            }

            return null;
        }

        return null;
    });

    useEffect(() => {
        const func = async (): Promise<void> => {
            await getTalkInfo(talk.guid);
        };

        const intervalMs = talk.has_problems?.length
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
        talk.guid,
        talk.has_problems?.length,
        talk.title,
        talkInfo?.is_downloading,
    ]);

    const statusColor = useMemo((): Property.BorderColor | null => {
        let status: MediaItemStatus | null;

        if (typeof talkInfo?.files === 'undefined') {
            return null;
        }

        const videoFiles = talkInfo?.files?.filter(file => file.is_video);

        if (talk.has_problems?.length) {
            status = MediaItemStatus.Problem;
        } else if (talkInfo?.is_downloading) {
            status = MediaItemStatus.Downloading;
        } else if (videoFiles?.length) {
            status = MediaItemStatus.Downloaded;
        } else {
            status = MediaItemStatus.Missing;
        }

        if (status !== null) {
            return getMediaItemStatusColor(theme)[status];
        }

        return null;
    }, [talk.has_problems?.length, talkInfo, theme]);

    return (
        <StyledContainer
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            ref={containerRef}
            data-media-item-slug={talk.slug}
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
                    href={specificTalkPageLink(talk.slug)}
                    style={{ flex: 1 }}
                    tabIndex={-1}
                    disabled={!!talk.has_problems?.length}
                >
                    <CardActionArea
                        sx={{ height: '100%' }}
                        disabled={!!talk.has_problems?.length}
                    >
                        <Box
                            height="100%"
                            sx={{
                                ...(statusColor
                                    ? {
                                          borderBottomColor: statusColor,
                                          borderBottomWidth: 2,
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
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        aspectRatio: '16/9',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        boxShadow: 1,
                                    }}
                                >
                                    <Image
                                        src={talk.poster_url}
                                        fill
                                        style={{
                                            objectFit: 'cover',
                                        }}
                                        alt={talk.title}
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </Box>
                            </CardMedia>
                            <CardHeader
                                title={talk.title}
                                subheader={`${moment(talk.date).format(longDateFormat)} - ${talk.conference.title}`}
                            />
                        </Box>
                    </CardActionArea>
                </InvisibleLink>
                {talk.has_problems?.length ? (
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
                            title={talk.has_problems.join(', ') || ''}
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
