'use client';

import type { FC } from 'react';
import { useMemo } from 'react';

import prettyBytes from 'pretty-bytes';

import { getMediaItemStatusColor, MediaItemStatus } from '@backend/talkUtils';

import TalkAttribute from '@/app/(authenticated)/talks/[slug]/_components/TalkAttribute';
import type { SingleTalkData } from '@/app/(authenticated)/talks/[slug]/page';

import { formatVideoDuration } from '@/utils/string';

import DescriptionIcon from '@mui/icons-material/Description';
import VideoIcon from '@mui/icons-material/VideoLibrary';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

export interface TalkFilesProps {
    data: SingleTalkData;
}

const TalkFiles: FC<TalkFilesProps> = ({ data }) => {
    const theme = useTheme();

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
        status !== null ? getMediaItemStatusColor(theme)[status] : null;

    return (
        <Box paddingX={2}>
            <Box mb={3}>
                <Typography variant="h5" borderBottom={1} mb={1}>
                    Information
                </Typography>
                <Box
                    display="flex"
                    flexDirection="row"
                    columnGap={2}
                    rowGap={1}
                    flexWrap="wrap"
                >
                    <TalkAttribute name="Path" value={data.info.folder} />
                    <TalkAttribute
                        name="Size"
                        value={prettyBytes(videoSize)}
                        title={`${videoSize} bytes`}
                    />
                    <TalkAttribute name="Duration" value={videoDuration} />
                    <TalkAttribute
                        name="Status"
                        value={
                            status === MediaItemStatus.Downloading
                                ? `Downloading (${data.info.download_progress}%)`
                                : status === MediaItemStatus.Downloaded
                                  ? 'Downloaded'
                                  : status === MediaItemStatus.Missing
                                    ? 'Missing'
                                    : status === MediaItemStatus.Problem
                                      ? 'Problem'
                                      : 'Unknown'
                        }
                        color={statusColor}
                    />
                    {data.info.download_error ? (
                        <TalkAttribute
                            name="Download Error"
                            value={data.info.download_error}
                            color={theme.palette.error.main}
                        />
                    ) : null}
                </Box>
            </Box>
            <Box mb={3}>
                <Typography variant="h5" borderBottom={1}>
                    Videos
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
                            <ListItemText primary="No video files" />
                        </ListItem>
                    ) : null}
                </List>
            </Box>
            <Box mb={3}>
                <Typography variant="h5" borderBottom={1}>
                    Other Files
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
                            <ListItemText primary="No other files" />
                        </ListItem>
                    ) : null}
                </List>
            </Box>
        </Box>
    );
};

export default TalkFiles;
