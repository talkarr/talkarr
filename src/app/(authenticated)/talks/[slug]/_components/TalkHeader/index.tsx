import type { FC } from 'react';

import moment from 'moment';

import type { SingleTalkData } from '@/app/(authenticated)/talks/[slug]/page';

import { formatLanguageCode } from '@/utils/string';

import { longDateFormat, yearOnlyFormat } from '@/constants';

import SmallText from '@components/SmallText';
import TalkImage from '@components/TalkImage';
import VideoMetaBadge from '@components/VideoMetaBadge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface TalkHeaderProps {
    data: SingleTalkData;
}

const bottomPadding = 1;

const TalkHeader: FC<TalkHeaderProps> = ({ data }) => (
    <Box paddingX={2} paddingTop={1}>
        <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            gap={2}
            flexWrap="wrap"
        >
            <Box flex={1}>
                <TalkImage data={data.db} maxWidth="100%" height="auto" />
            </Box>
            <Box flex={2} display="flex" flexDirection="column" gap={2}>
                <Typography variant="h2">
                    {data.db.title} (
                    {moment(data.db.date).format(yearOnlyFormat)})
                </Typography>
                <Box>
                    <Typography variant="body1">
                        {data.db.description}
                    </Typography>
                </Box>
                <Box
                    display="flex"
                    flexDirection="row"
                    gap={1.5}
                    flexWrap="wrap"
                >
                    {data.db.conference.title ? (
                        <Box>
                            <SmallText mb={bottomPadding}>Conference</SmallText>
                            <VideoMetaBadge
                                badgeType="conference"
                                badgeContent={data.db.conference.title}
                                size="small"
                            />
                        </Box>
                    ) : null}
                    {data.db.date ? (
                        <Box>
                            <SmallText mb={bottomPadding}>Date</SmallText>
                            <VideoMetaBadge
                                badgeType="date"
                                badgeContent={moment(data.db.date).format(
                                    longDateFormat,
                                )}
                                size="small"
                                disableOnClick
                            />
                        </Box>
                    ) : null}
                    {data.db.original_language ? (
                        <Box>
                            <SmallText mb={bottomPadding}>Language</SmallText>
                            <VideoMetaBadge
                                badgeType="language"
                                badgeContent={formatLanguageCode(
                                    data.db.original_language,
                                )}
                                size="small"
                                disableOnClick
                            />
                        </Box>
                    ) : null}
                    {data.db.persons.length > 0 ? (
                        <Box>
                            <SmallText mb={bottomPadding}>Speaker</SmallText>
                            <Box
                                display="flex"
                                flexDirection="row"
                                gap={1}
                                flexWrap="wrap"
                            >
                                {data.db.persons.map((text, index) => (
                                    <VideoMetaBadge
                                        key={`speaker-badge-${index}`}
                                        badgeType="speaker"
                                        badgeContent={text}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Box>
                    ) : null}
                    {data.db.tags.length > 0 ? (
                        <Box>
                            <SmallText mb={bottomPadding}>Tags</SmallText>
                            <Box
                                display="flex"
                                flexDirection="row"
                                gap={1}
                                flexWrap="wrap"
                            >
                                {data.db.tags.map((text, index) => (
                                    <VideoMetaBadge
                                        key={`tag-badge-${index}`}
                                        badgeType="tag"
                                        badgeContent={text}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Box>
                    ) : null}
                </Box>
            </Box>
        </Box>
    </Box>
);

export default TalkHeader;
