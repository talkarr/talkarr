'use client';

import type { VideoBadgeType } from '@components/VideoMetaBadge';

import type { FC } from 'react';
import React, { useMemo } from 'react';

import TimeIcon from '@mui/icons-material/AccessTime';
import DateIcon from '@mui/icons-material/DateRange';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';

import Grid from '@mui/material/Grid';

import moment from 'moment';

import { formatLanguageCode, formatVideoDuration } from '@/utils/string';

import { longDateFormat } from '@/constants';
import type { TalkData } from '@/stores/ui-store';

import VideoMetaBadge from '@components/VideoMetaBadge';

export interface SearchItemBadgesProps {
    item: TalkData | null;
    disableOnClick?: boolean;
}

const SearchItemBadges: FC<SearchItemBadgesProps> = ({
    item,
    disableOnClick,
}) => {
    const badges = useMemo(() => {
        if (!item) {
            return null;
        }

        const badgesArray: {
            text: string;
            type: VideoBadgeType;
            imageUrl?: string;
            icon?: React.ReactNode;
            disableOnClick?: boolean;
        }[] = [];

        if (item.conference_title) {
            const logoUrl = item.conference_data?.logo_url;

            badgesArray.push({
                text: item.conference_title,
                type: 'conference',
                imageUrl: logoUrl,
            });
        }

        if (item.persons.length > 0) {
            for (const person of item.persons) {
                if (person) {
                    badgesArray.push({
                        text: person,
                        type: 'speaker',
                        icon: <PersonIcon />,
                    });
                }
            }
        }

        if (item.original_language) {
            badgesArray.push({
                text: formatLanguageCode(item.original_language),
                type: 'language',
                icon: <LanguageIcon />,
            });
        }

        if (item.tags.length > 0) {
            for (const tag of item.tags) {
                if (tag) {
                    badgesArray.push({
                        text: tag,
                        type: 'tag',
                        icon: <TagIcon />,
                    });
                }
            }
        }

        if (item.date) {
            badgesArray.push({
                text: moment(item.date).format(longDateFormat),
                type: 'date',
                icon: <DateIcon />,
                disableOnClick: true,
            });
        }

        badgesArray.push({
            type: 'duration',
            text: formatVideoDuration(item.duration),
            icon: <TimeIcon />,
            disableOnClick: true,
        });

        return badgesArray;
    }, [item]);

    if (!item || !badges?.length) {
        return null;
    }

    return (
        <Grid
            container
            spacing={1}
            mb={item.subtitle ? 1 : undefined}
            alignItems="center"
            gridAutoRows="1fr"
        >
            {badges.map((badge, index) => (
                <Grid key={`badge-${index}-${badge.type}`}>
                    <VideoMetaBadge
                        badgeContent={badge.text}
                        imageUrl={badge.imageUrl}
                        icon={badge.icon}
                        badgeType={badge.type}
                        disableOnClick={disableOnClick || badge.disableOnClick}
                        disableTitle={disableOnClick || badge.disableOnClick}
                        style={{
                            height: 32,
                        }}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default SearchItemBadges;
