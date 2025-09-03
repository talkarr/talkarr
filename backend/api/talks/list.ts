import {
    checkEventForProblems,
    listEvents,
    mapResultFiles,
} from '@backend/events';
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
import { problemMap, ProblemType } from '@backend/types';

const log = rootLog.child({ label: 'api/talks/list' });

const handleListEventsRequest = async (
    _req: ExpressRequest<'/talks/list', 'get'>,
    res: ExpressResponse<'/talks/list', 'get'>,
): Promise<void> => {
    const events = await listEvents();

    const start = Date.now();

    const mappedEvents = await Promise.all(
        events.map(async (event, index, { length }) => {
            const debugTimeMarks: Record<string, number> = {
                start_0: 0,
                checkProblems_1: 0,
                mapFiles_2: 0,
                generateStatus_3: 0,
                end_4: 0,
            };

            debugTimeMarks.start_0 = Date.now();

            const problems = await checkEventForProblems({
                rootFolderPath: event.root_folder.path,
                eventInfoGuid: event.eventInfo?.guid,
                cacheFilesystemCheck: true,
            });

            debugTimeMarks.checkProblems_1 = Date.now();
            log.info(
                `checkProblems took ${debugTimeMarks.checkProblems_1 - debugTimeMarks.start_0}ms`,
            );

            const hasProblems =
                problems?.map(problem => problemMap[problem] ?? problem) ||
                null;

            const file = event.file?.map(f =>
                mapResultFiles({
                    file: f,
                    rootFolderPath: event.root_folder.path,
                }),
            );

            debugTimeMarks.mapFiles_2 = Date.now();
            log.info(
                `mapFiles took ${debugTimeMarks.mapFiles_2 - debugTimeMarks.checkProblems_1}ms`,
            );

            const status = generateMediaItemStatus({
                talk: {
                    has_problems: hasProblems,
                },
                talkInfo: {
                    is_downloading: !!event.eventInfo?.is_downloading,
                    files: file || [],
                },
            });

            debugTimeMarks.generateStatus_3 = Date.now();
            log.info(
                `generateStatus took ${debugTimeMarks.generateStatus_3 - debugTimeMarks.mapFiles_2}ms`,
            );

            log.debug('Processing event', {
                index,
                length,
                title: event.title,
                status,
                hasProblems,
            });

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { file: _, ...eventWithoutFile } = event;

            debugTimeMarks.end_4 = Date.now();
            log.info(
                `Total processing took ${debugTimeMarks.end_4 - debugTimeMarks.start_0}ms`,
            );

            return {
                ...(eventWithoutFile as unknown as ConvertDateToStringType<ExtendedDbEvent>),
                persons: event.persons.map(person => person.name),
                tags: event.tags.map(tag => tag.name),
                root_folder_has_mark: problems?.includes(
                    ProblemType.RootFolderMarkNotFound,
                ),
                has_problems: hasProblems,
                status,
                duration: Number(event.duration),
                duration_str: event.duration.toString(),
            };
        }),
    );

    log.info(`Mapped ${mappedEvents.length} events in ${Date.now() - start}ms`);

    res.json({
        success: true,
        data: {
            events: mappedEvents,
            statusCount: generateStatusMap(mappedEvents),
        },
    });
};

export default handleListEventsRequest;
