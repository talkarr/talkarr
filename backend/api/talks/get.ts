import {
    checkEventForProblems,
    getSpecificTalkByGuid,
    getSpecificTalkBySlug,
    getTalkInfoByGuid,
} from '@backend/events';
import { getTalkFromApiByGuid } from '@backend/helper';
import rootLog from '@backend/root-log';
import { generateMediaItemStatus } from '@backend/talk-utils';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
    ExtendedDbEvent,
} from '@backend/types';
import { problemMap } from '@backend/types';

const log = rootLog.child({ label: 'talks/get' });

const handleGetEventRequest = async (
    req: ExpressRequest<'/talks/get', 'get'>,
    res: ExpressResponse<'/talks/get', 'get'>,
): Promise<void> => {
    const { guid, slug } = req.query;

    if (!guid && !slug) {
        log.error('guid or slug is required.');

        res.status(400).json({
            success: false,
            error: 'guid or slug is required.',
        });

        return;
    }

    let event: ExtendedDbEvent | null = null;

    if (guid) {
        event = await getSpecificTalkByGuid({ guid, withFiles: false });
    } else if (slug) {
        event = await getSpecificTalkBySlug({ slug, withFiles: false });
    }

    if (!event) {
        log.error('Talk not found.');

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    let talkData;

    try {
        talkData = await getTalkFromApiByGuid({
            guid: event.guid,
            cache: {
                cacheKey: `talks/get/${event.guid}`,
            },
        });
    } catch (error) {
        log.error('Error fetching talk from API:', {
            error,
            guid: event.guid,
        });

        res.status(500).json({
            success: false,
            error: 'Error fetching talk from API.',
        });

        return;
    }

    const talkInfo = await getTalkInfoByGuid({ guid: event.guid });

    if (!talkData || !talkInfo) {
        log.error('Talk not found in API.', {
            guid: event.guid,
            isTalkDataNull: talkData === null,
            isTalkInfoNull: talkInfo === null,
        });

        res.status(404).json({
            success: false,
            error: 'Talk not found in API.',
        });

        return;
    }

    const hasProblems =
        (
            await checkEventForProblems({
                rootFolderPath: event.root_folder.path,
                downloadError: talkInfo.download_error,
                cacheFilesystemCheck: false,
            })
        )
            // eslint-disable-next-line unicorn/no-await-expression-member
            ?.map(problem => problemMap[problem] ?? problem) || null;

    res.json({
        success: true,
        data: {
            db: {
                ...(event as unknown as ConvertDateToStringType<ExtendedDbEvent>),
                persons: event.persons.map(person => person.name),
                tags: event.tags.map(tag => tag.name),
                has_problems: hasProblems,
                duration: Number(event.duration),
                duration_str: event.duration.toString(),
            },
            talk: talkData,
            info: {
                ...talkInfo,
                status: generateMediaItemStatus({
                    talk: {
                        has_problems: hasProblems,
                    },
                    talkInfo: {
                        files: talkInfo.files,
                        is_downloading: talkInfo.is_downloading,
                    },
                }),
            },
        },
    });
};

export default handleGetEventRequest;
