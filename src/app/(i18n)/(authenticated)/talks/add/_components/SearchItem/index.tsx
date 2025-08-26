'use client';

import type { FC } from 'react';
import React, { useMemo } from 'react';
import Markdown from 'react-markdown';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import moment from 'moment';

import { yearOnlyFormat } from '@/constants';
import { useUiStore } from '@/providers/ui-store-provider';
import type { TalkData } from '@/stores/ui-store';

import searchItemCss from './searchitem.module.css';

import SearchItemBadges from '@components/SearchItemBadges';
// eslint-disable-next-line import/no-cycle
import TalkImage from '@components/TalkImage';

export interface SearchItemProps {
    item: TalkData;
    isAlreadyAdded?: boolean;
}

export const searchItemMinHeight = 290;

// calculate 16/9 ratio max width from minHeight
export const searchItemMaxImageWidth = Math.floor(
    searchItemMinHeight * (16 / 9),
);

const StyledCard = styled(Card)(({ theme }) => ({
    minHeight: searchItemMinHeight,
    maxHeight: '500px',
    [theme.breakpoints.down('lg')]: {
        maxHeight: 'none',
    },
    borderRadius: theme.shape.borderRadius * 4,

    // header
    '& .MuiCardHeader-root': {
        padding: theme.spacing(1, 2),
    },

    // content
    '& .MuiCardContent-root': {
        padding: theme.spacing(1, 2),
    },

    '& .MuiCardActionArea-root': {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'row',
        // flexWrap: 'wrap',
        [theme.breakpoints.down('lg')]: {
            flexDirection: 'column',
        },
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },

    '& .MuiCardHeader-subheader': {
        ...theme.typography.subtitle1,
    },
}));

export const SearchItemSkeleton: FC = () => (
    <Skeleton
        variant="rectangular"
        height={searchItemMinHeight}
        sx={{ borderRadius: 4 }}
        animation="wave"
    />
);

const SearchItem: FC<SearchItemProps> = ({ item, isAlreadyAdded }) => {
    const openAddTalkModal = useUiStore(state => state.openAddTalkModal);

    const title = useMemo(() => {
        const year = moment(item.date).format(yearOnlyFormat);

        return `${item.title} (${year})`;
    }, [item]);

    return (
        <StyledCard
            sx={{
                opacity: isAlreadyAdded ? 0.5 : 1,
            }}
            data-testid="search-item"
            data-slug={item.slug}
            data-is-already-added={isAlreadyAdded ? 'true' : 'false'}
        >
            <CardActionArea
                onClick={() => (isAlreadyAdded ? null : openAddTalkModal(item))}
                disabled={isAlreadyAdded}
                data-testid="search-item-action"
            >
                <CardMedia sx={{ maxWidth: '100%' }}>
                    <TalkImage
                        data={item}
                        maxWidth="100%"
                        maxHeight="fit-content"
                    />
                </CardMedia>
                <Box display="flex" flexDirection="column" mb={1}>
                    <CardHeader
                        title={
                            <Box display="flex" gap={2} flexDirection="column">
                                <Box
                                    display="flex"
                                    gap={1}
                                    flexWrap="wrap"
                                    flex={1}
                                >
                                    <Typography
                                        variant="h3"
                                        minWidth="fit-content"
                                    >
                                        {title}
                                    </Typography>
                                    {isAlreadyAdded ? (
                                        <Box display="flex" alignItems="center">
                                            <CheckCircleIcon color="primary" />
                                        </Box>
                                    ) : null}
                                </Box>
                                <SearchItemBadges item={item} />
                            </Box>
                        }
                        subheader={
                            item.subtitle
                                ? item.description?.startsWith(item.subtitle)
                                    ? undefined
                                    : item.subtitle
                                : undefined
                        }
                    />
                    {item.description ? (
                        <CardContent style={{ marginBottom: 4 }}>
                            <div
                                className={searchItemCss.markdown}
                                data-testid="search-item-description"
                            >
                                <Markdown skipHtml>{item.description}</Markdown>
                            </div>
                        </CardContent>
                    ) : null}
                </Box>
            </CardActionArea>
        </StyledCard>
    );
};

export default SearchItem;
