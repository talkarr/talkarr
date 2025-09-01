import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { SingleTalkData } from '@/app/(i18n)/(authenticated)/talks/[slug]/page';

import { formatLanguageCode } from '@/utils/string';

import { longDateFormat, yearOnlyFormat } from '@/constants';

import NoSsrMoment from '@components/NoSsrMoment';
import SmallText from '@components/SmallText';
import TalkImage from '@components/TalkImage';
import VideoMetaBadge from '@components/VideoMetaBadge';

export interface TalkHeaderProps {
    data: SingleTalkData;
}

const bottomPadding = 1;

const TalkHeader: FC<TalkHeaderProps> = ({ data }) => {
    const { t } = useTranslation();

    return (
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
                        <NoSsrMoment>
                            {moment => (
                                <>
                                    {data.db.title} (
                                    {moment(data.db.date).format(
                                        yearOnlyFormat,
                                    )}
                                    )
                                </>
                            )}
                        </NoSsrMoment>
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
                                <SmallText mb={bottomPadding}>
                                    {t('talks.conference')}
                                </SmallText>
                                <VideoMetaBadge
                                    badgeType="conference"
                                    badgeContent={data.db.conference.title}
                                    size="small"
                                />
                            </Box>
                        ) : null}
                        <Box>
                            <SmallText mb={bottomPadding}>
                                {t('talks.date')}
                            </SmallText>
                            <NoSsrMoment>
                                {moment => (
                                    <VideoMetaBadge
                                        badgeType="date"
                                        badgeContent={moment(
                                            data.db.date,
                                        ).format(longDateFormat)}
                                        size="small"
                                        disableOnClick
                                    />
                                )}
                            </NoSsrMoment>
                        </Box>
                        {data.db.original_language ? (
                            <Box>
                                <SmallText mb={bottomPadding}>
                                    {t('talks.language')}
                                </SmallText>
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
                                <SmallText mb={bottomPadding}>
                                    {t('talks.speakers')}
                                </SmallText>
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
                                <SmallText mb={bottomPadding}>
                                    {t('talks.tags')}
                                </SmallText>
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
};

export default TalkHeader;
