import {
    checkEventForProblems,
    listEvents,
    mapResultFiles,
} from '@backend/events';
import { isFolderMarked } from '@backend/fs';
import rootLog from '@backend/rootLog';
import type { MediaItemStatus } from '@backend/talkUtils';
import {
    generateMediaItemStatus,
    mediaItemStatusValues,
} from '@backend/talkUtils';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
    ExtendedDbEvent,
} from '@backend/types';
import { problemMap } from '@backend/types';

const log = rootLog.child({ label: 'api/talks/list' });

const handleListEventsRequest = async (
    _req: ExpressRequest<'/talks/list', 'get'>,
    res: ExpressResponse<'/talks/list', 'get'>,
): Promise<void> => {
    const events = await listEvents();

    const mappedEvents = await Promise.all(
        events.map(async (event, index, { length }) => {
            const hasProblems =
                (
                    await checkEventForProblems({
                        rootFolderPath: event.root_folder.path,
                    })
                )?.map(problem => problemMap[problem] ?? problem) || null;

            const status = generateMediaItemStatus({
                talk: {
                    has_problems: hasProblems,
                },
                talkInfo: {
                    is_downloading: !!event.eventInfo?.is_downloading,
                    files:
                        event.file?.map(file =>
                            mapResultFiles({
                                file,
                                rootFolderPath: event.root_folder.path,
                            }),
                        ) || [],
                },
            });

            log.info('Processing event', {
                index,
                length,
                title: event.title,
                status,
                hasProblems,
            });

            return {
                ...(event as unknown as ConvertDateToStringType<ExtendedDbEvent>),
                persons: event.persons.map(person => person.name),
                tags: event.tags.map(tag => tag.name),
                root_folder_has_mark: await isFolderMarked({
                    rootFolderPath: event.rootFolderPath,
                }),
                has_problems: hasProblems,
                status,
            };
        }),
    );

    const statusMap = mediaItemStatusValues.reduce(
        (acc, status) => ({
            ...acc,
            [status]: 0,
        }),
        {},
    ) as Record<MediaItemStatus, number>;

    for await (const event of mappedEvents) {
        if (event.status !== null) {
            statusMap[event.status] += 1;
        }
    }

    res.json({
        success: true,
        data: {
            events: mappedEvents,
            statusCount: statusMap,
        },
    });
};

export default handleListEventsRequest;
