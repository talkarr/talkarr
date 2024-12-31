'use client';

import Image from 'next/image';

import type { FC } from 'react';

import moment from 'moment';

import { longDateFormat } from '@/constants';

import type { SuccessData } from '@backend/types';
import { Grid2, styled } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';

export interface MediaItemProps {
    talk: SuccessData<'/talks/list', 'get'>[0];
}

export const mediaItemRatio = '4/2.95';

const StyledContainer = styled(Grid2)(({ theme }) => ({
    position: 'relative',
    aspectRatio: mediaItemRatio,
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
}));

const MediaItem: FC<MediaItemProps> = ({ talk }) => (
    <StyledContainer
        key={talk.guid}
        size={2}
        sx={{ position: 'relative', aspectRatio: mediaItemRatio }}
    >
        <Card
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <CardMedia>
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
                        layout="fill"
                        objectFit="cover"
                        alt={talk.title}
                    />
                </Box>
            </CardMedia>
            <CardHeader
                sx={{
                    '& .MuiCardHeader-content': {
                        display: 'block',
                        overflow: 'hidden',
                    },
                    p: 1,
                }}
                titleTypographyProps={{
                    noWrap: true,
                    textOverflow: 'ellipsis',
                }}
                title={talk.title}
                subheader={`${moment(talk.date).format(longDateFormat)} - ${talk.conference.title}`}
            />
        </Card>
    </StyledContainer>
);

export default MediaItem;
