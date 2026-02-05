import type { Conference as DbConference } from '@prisma-generated/client';

import {
    getConferencesFromEvents,
    listEvents,
    mapResultFiles,
} from '@backend/events';
import { isFolderMarked } from '@backend/fs';
import rootLog from '@backend/root-log';
import {
    generateMediaItemStatus,
    generateStatusMap,
} from '@backend/talk-utils';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
    ExtendedDbEvent,
} from '@backend/types';
import { problemMap } from '@backend/types';

const log = rootLog.child({ label: 'api/talks/list' });

const handleListEventsRequest = async (
    req: ExpressRequest<'/talks/list', 'get'>,
    res: ExpressResponse<'/talks/list', 'get'>,
): Promise<void> => {
    const { query } = req;

    const { page, limit } = query;

    // if one of page or limit is provided, both must be provided
    if ((page && !limit) || (!page && limit)) {
        res.status(400).json({
            success: false,
            error: 'Both page and limit must be provided',
        });
        return;
    }

    const events = await listEvents();

    const mappedEvents = await Promise.all(
        events.map(async (event, index, { length }) => {
            const mappedProblems =
                event.problems?.map(
                    problem => problemMap[problem] ?? problem,
                ) || null;

            const file = event.file?.map(f =>
                mapResultFiles({
                    file: f,
                    rootFolderPath: event.root_folder.path,
                }),
            );

            const status = generateMediaItemStatus({
                // do not include hasProblems to improve performance
                talk: {
                    problems: event.problems,
                },
                talkInfo: {
                    is_downloading: !!event.eventInfo?.is_downloading,
                    files: file || [],
                },
            });

            log.debug('Processing event', {
                index,
                length,
                title: event.title,
                status,
            });

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { file: _, ...eventWithoutFile } = event;

            return {
                ...(eventWithoutFile as unknown as ConvertDateToStringType<ExtendedDbEvent>),
                persons: event.persons.map(person => person.name),
                tags: event.tags.map(tag => tag.name),
                root_folder_has_mark: await isFolderMarked({
                    rootFolderPath: event.rootFolderPath,
                    cacheFilesystemCheck: true,
                }),
                mapped_problems: mappedProblems,
                status,
                duration: Number(event.duration),
                duration_str: event.duration.toString(),
                conference: undefined,
                description: null,
            };
        }),
    );

    const limitedEvents =
        typeof page !== 'undefined' && typeof limit !== 'undefined'
            ? mappedEvents.slice((page - 1) * limit, page * limit)
            : mappedEvents;

    const conferencesFromEvents = await getConferencesFromEvents({
        events,
    });

    res.json({
        success: true,
        data: {
            events: limitedEvents,
            total: mappedEvents.length,
            page: page ? Number(page) : null,
            limit: limit ? Number(limit) : null,
            statusCount: generateStatusMap(mappedEvents),
            conferences: conferencesFromEvents.map(conference => ({
                ...(conference as unknown as ConvertDateToStringType<DbConference>),
                updated_at: conference.updated_at.toISOString(),
            })),
        },
    });
};

export default handleListEventsRequest;
