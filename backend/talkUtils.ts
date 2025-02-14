import type { Theme } from '@mui/material';

import type {
    ConvertDateToStringType,
    ExtendedDbEvent,
    SuccessData,
    SuccessResponse,
    TypeOrPick,
} from '@backend/types';

export enum MediaItemStatus {
    Downloaded = 'Downloaded',
    Missing = 'Missing',
    Downloading = 'Downloading',
    Problem = 'Problem',
}

export type TalkInfoData = SuccessResponse<'/talks/info', 'get'>['data'];

export const mediaItemStatusValues = Object.values(MediaItemStatus);

export const getMediaItemStatusColor = (
    theme: Theme,
): Record<MediaItemStatus, string> => ({
    [MediaItemStatus.Downloaded]: theme.palette.success.main,
    [MediaItemStatus.Missing]: theme.palette.warning.main,
    [MediaItemStatus.Downloading]: theme.palette.info.main,
    [MediaItemStatus.Problem]: theme.palette.error.main,
});

export const mediaItemStatusTextMap: Record<MediaItemStatus, string> = {
    [MediaItemStatus.Downloaded]: 'Downloaded videos',
    [MediaItemStatus.Missing]: 'Missing videos',
    [MediaItemStatus.Downloading]: 'Downloading files',
    [MediaItemStatus.Problem]: 'Problem with event',
};

export const generateMediaItemStatus = ({
    talkInfo,
    talk,
}: {
    talkInfo:
        | TalkInfoData
        | Pick<TalkInfoData, 'files' | 'is_downloading'>
        | null;
    talk:
        | SuccessData<'/talks/list', 'get'>['events'][0]
        | Pick<SuccessData<'/talks/list', 'get'>['events'][0], 'has_problems'>;
}): MediaItemStatus | null => {
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

    return status;
};

export const generateStatusMap = (
    events: ConvertDateToStringType<
        TypeOrPick<
            ExtendedDbEvent & {
                status: MediaItemStatus | null;
            },
            'status'
        >
    >[],
): Record<MediaItemStatus, number> => {
    const statusMap = mediaItemStatusValues.reduce(
        (acc, status) => ({
            ...acc,
            [status]: 0,
        }),
        {},
    ) as Record<MediaItemStatus, number>;

    for (const event of events) {
        if (event.status !== null) {
            statusMap[event.status] += 1;
        }
    }

    return statusMap;
};
