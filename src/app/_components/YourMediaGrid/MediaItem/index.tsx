'use client';

import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

import ProblemIcon from '@mui/icons-material/ReportProblem';

import moment from 'moment-timezone';

import { getMediaItemStatusColor } from '@backend/talk-utils';
import type { SuccessData } from '@backend/types';

import useOnScreen from '@/hooks/use-on-screen';
import useUserTimezone from '@/hooks/use-user-timezone';

import { convertBlurhashToDataURL } from '@/utils/blurhash';
import { generateCacheUrl } from '@/utils/cache';

import { longDateFormat, specificTalkPageLink } from '@/constants';
import { useApiStore } from '@/providers/api-store-provider';

import CircularProgressWithLabel from '@components/CircularProgressWithLabel';
import InvisibleLink from '@components/InvisibleLink';
import CustomImage, {
    BlurhashNotAvailableYet,
} from '@components/NoSsrCustomImage/components/CustomImage';

export interface MediaItemProps {
    initialData: SuccessData<'/talks/list', 'get'>['events'][0];
    conference: SuccessData<'/talks/list', 'get'>['conferences'][0];
}

const StyledContainer = styled(Grid)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 3,
    overflow: 'hidden',
}));

const MediaItem: FC<MediaItemProps> = ({ initialData, conference }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const timezone = useUserTimezone();

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

        const intervalMs = initialData.problems?.length
            ? 20_000
            : talkInfo?.is_downloading
              ? 1000
              : 5000;

        let interval = null;

        if (isVisible) {
            interval = setInterval(func, intervalMs);
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
        initialData.problems?.length,
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

    const blurDataURL = useMemo(
        () =>
            initialData.poster_url_blur
                ? convertBlurhashToDataURL({
                      customBlurhash: initialData.poster_url_blur,
                  })
                : undefined,
        [initialData.poster_url_blur],
    );

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
                                ...(status === null
                                    ? {}
                                    : {
                                          borderBottomColor:
                                              getMediaItemStatusColor(theme)[
                                                  status
                                              ],
                                          borderBottomWidth: 4,
                                          borderBottomStyle: 'solid',
                                      }),
                            }}
                        >
                            <CardMedia>
                                {imageLoaded && !blurDataURL ? null : (
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
                                    <CustomImage
                                        src={generateCacheUrl({
                                            url: initialData.poster_url,
                                            cacheKey: `poster-${initialData.guid}`,
                                        })}
                                        blurDataURL={
                                            blurDataURL ||
                                            BlurhashNotAvailableYet
                                        }
                                        sizes="300px"
                                        alt={
                                            imageLoaded ? initialData.title : ''
                                        }
                                        suppressHydrationWarning
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </Box>
                            </CardMedia>
                            <CardHeader
                                title={initialData.title}
                                subheader={`${moment(initialData.date)
                                    .tz(timezone)
                                    .format(
                                        longDateFormat,
                                    )} - ${conference.title}`}
                            />
                        </Box>
                    </CardActionArea>
                </InvisibleLink>
                {initialData.mapped_problems?.length ? (
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
                            title={
                                initialData.mapped_problems?.join(', ') || ''
                            }
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
                                    {t('components.mediaItem.problem')}
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
