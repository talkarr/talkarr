'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import DescriptionIcon from '@mui/icons-material/Description';
import VideoIcon from '@mui/icons-material/VideoLibrary';

import prettyBytes from 'pretty-bytes';

import { getMediaItemStatusColor, MediaItemStatus } from '@backend/talk-utils';

import TalkAttribute from '@/app/(i18n)/(authenticated)/talks/[slug]/_components/TalkAttribute';
import type { SingleTalkData } from '@/app/(i18n)/(authenticated)/talks/[slug]/page';

import { formatVideoDuration } from '@/utils/string';

export interface TalkFilesProps {
    data: SingleTalkData;
}

const TalkFiles: FC<TalkFilesProps> = ({ data }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const videoFiles = useMemo(
        () => data.info.files.filter(file => file.is_video),
        [data.info.files],
    );

    const otherFiles = useMemo(
        () => data.info.files.filter(file => !file.is_video),
        [data.info.files],
    );

    const videoSize = useMemo(
        () => videoFiles.reduce((acc, file) => acc + file.size, 0),
        [videoFiles],
    );

    const videoDuration = useMemo(
        () => formatVideoDuration(data.db.duration),
        [data.db.duration],
    );

    const { status } = data.info;

    const statusColor =
        status === null ? null : getMediaItemStatusColor(theme)[status];

    return (
        <Box paddingX={2}>
            <Box mb={3}>
                <Typography variant="h5" borderBottom={1} mb={1}>
                    {t('pages.singleTalkPage.information')}
                </Typography>
                <Box
                    display="flex"
                    flexDirection="row"
                    columnGap={2}
                    rowGap={1}
                    flexWrap="wrap"
                >
                    <TalkAttribute
                        name={t('talks.path')}
                        value={data.info.folder}
                    />
                    <TalkAttribute
                        name={t('talks.size')}
                        value={prettyBytes(videoSize)}
                        title={`${videoSize} bytes`}
                    />
                    <TalkAttribute
                        name={t('talks.duration')}
                        value={videoDuration}
                    />
                    <TalkAttribute
                        name={t('talks.status')}
                        value={
                            status === MediaItemStatus.Downloading
                                ? t('talks.statusValues.downloading', {
                                      progress: data.info.download_progress,
                                  })
                                : status === MediaItemStatus.Downloaded
                                  ? t('talks.statusValues.downloaded')
                                  : status === MediaItemStatus.Missing
                                    ? t('talks.statusValues.missing')
                                    : status === MediaItemStatus.Problem
                                      ? t('talks.statusValues.problem')
                                      : t('talks.statusValues.unknown')
                        }
                        color={statusColor}
                    />
                    {data.info.download_error ? (
                        <TalkAttribute
                            name={t('talks.downloadError')}
                            value={data.info.download_error}
                            color={theme.palette.error.main}
                        />
                    ) : null}
                </Box>
            </Box>
            <Box mb={3}>
                <Typography variant="h5" borderBottom={1}>
                    {t('pages.singleTalkPage.videos')}
                </Typography>
                <List disablePadding>
                    {videoFiles.map(file => (
                        <ListItem key={`file-${file.path}`} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <VideoIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.filename}
                                    secondary={prettyBytes(file.size)}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {videoFiles.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={t('talks.noVideoFiles')} />
                        </ListItem>
                    ) : null}
                </List>
            </Box>
            <Box mb={3}>
                <Typography variant="h5" borderBottom={1}>
                    {t('pages.singleTalkPage.otherFiles')}
                </Typography>
                <List disablePadding>
                    {otherFiles.map(file => (
                        <ListItem key={`file-${file.path}`} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <DescriptionIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.filename}
                                    secondary={prettyBytes(file.size)}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {otherFiles.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={t('talks.noOtherFiles')} />
                        </ListItem>
                    ) : null}
                </List>
            </Box>
        </Box>
    );
};

export default TalkFiles;
