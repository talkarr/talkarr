'use client';

import Image from 'next/image';

import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';

import moment from 'moment';

import { longDateFormat } from '@/constants';

import searchItemCss from './searchitem.module.css';

import type { SuccessData } from '@backend/types';
import CustomBadge from '@components/CustomBadge';
import ImageFallback from '@components/ImageFallback';
import type { BadgeProps } from '@mui/material';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

export interface SearchItemProps {
    item: SuccessData<'/search', 'get'>['events'][0];
}

const minHeight = 290;

// calculate 16/9 ratio max width from minHeight
const maxWidth = Math.floor(minHeight * (16 / 9));

const StyledCard = styled(Card)(({ theme }) => ({
    minHeight,
    maxHeight: '500px',
    borderRadius: theme.shape.borderRadius * 4,

    '& .MuiCardActionArea-root': {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },

    '& .MuiCardHeader-subheader': {
        ...theme.typography.subtitle1,
    },
}));

const SearchItem: FC<SearchItemProps> = ({ item }) => {
    const [showFallback, setShowFallback] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(true);

    useEffect(() => {
        setShowFallback(false);
    }, [item]);

    const title = useMemo(() => {
        const year = moment(item.date).format('YYYY');

        return `${item.title} (${year})`;
    }, [item]);

    const badges = useMemo(() => {
        const badgesArray: {
            text: string;
            color: BadgeProps['color'];
            type: string;
        }[] = [];

        if (item.conference_title) {
            badgesArray.push({
                text: item.conference_title,
                color: 'primary',
                type: 'Conference',
            });
        }

        if (item.persons.length > 0) {
            for (const person of item.persons) {
                if (person) {
                    badgesArray.push({
                        text: person,
                        color: 'secondary',
                        type: 'Person',
                    });
                }
            }
        }

        if (item.original_language) {
            badgesArray.push({
                text: item.original_language.toUpperCase(),
                color: 'info',
                type: 'Language',
            });
        }

        if (item.tags.length > 0) {
            for (const tag of item.tags) {
                if (tag) {
                    badgesArray.push({
                        text: tag,
                        color: 'success',
                        type: 'Tags',
                    });
                }
            }
        }

        if (item.release_date) {
            badgesArray.push({
                text: moment(item.release_date).format(longDateFormat),
                color: 'warning',
                type: 'Release Date',
            });
        }

        return badgesArray;
    }, [item]);

    return (
        <StyledCard>
            <CardActionArea>
                <CardMedia>
                    <div
                        style={{
                            position: 'relative',
                            maxWidth: `${maxWidth}px`,
                            height: `${minHeight}px`,
                            aspectRatio: '16 / 9',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}
                    >
                        {showFallback ? (
                            <ImageFallback />
                        ) : (
                            <>
                                <Image
                                    src={item.poster_url}
                                    alt={item.title}
                                    sizes="300px"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    onLoadingComplete={res => {
                                        console.log('res', res);
                                        if (res.naturalWidth === 0) {
                                            setShowFallback(true);
                                        }
                                        setImageLoading(false);
                                    }}
                                    onError={() => setShowFallback(true)}
                                />
                                {imageLoading ? (
                                    <Skeleton
                                        variant="rectangular"
                                        width={maxWidth}
                                        height={minHeight}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            borderRadius: '4px',
                                        }}
                                    />
                                ) : null}
                            </>
                        )}
                    </div>
                </CardMedia>
                <Box display="flex" flexDirection="column" mb={1}>
                    <CardHeader
                        title={
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Typography variant="h3" minWidth="fit-content">
                                    {title}
                                </Typography>
                                {badges.length ? (
                                    <Box
                                        display="flex"
                                        gap={1}
                                        flexWrap="wrap"
                                        mb={1}
                                    >
                                        {badges.map((badge, index) => (
                                            <CustomBadge
                                                key={index}
                                                badgeContent={badge.text}
                                                color={badge.color}
                                                title={badge.type}
                                            />
                                        ))}
                                    </Box>
                                ) : null}
                            </Box>
                        }
                        subheader={item.subtitle}
                    />
                    <CardContent style={{ marginBottom: 4 }}>
                        <Markdown skipHtml className={searchItemCss.markdown}>
                            {item.description || ''}
                        </Markdown>
                    </CardContent>
                </Box>
            </CardActionArea>
        </StyledCard>
    );
};

export default SearchItem;
