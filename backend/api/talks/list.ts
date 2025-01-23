import { checkEventForProblems, listEvents } from '@backend/events';
import { isFolderMarked } from '@backend/fs';
import type {
    ConvertDateToStringType,
    ExpressRequest,
    ExpressResponse,
    ExtendedDbEvent,
} from '@backend/types';
import { problemMap } from '@backend/types';

const handleListEventsRequest = async (
    _req: ExpressRequest<'/talks/list', 'get'>,
    res: ExpressResponse<'/talks/list', 'get'>,
): Promise<void> => {
    const events = await listEvents();

    res.json({
        success: true,
        data: await Promise.all(
            events.map(async event => ({
                ...(event as unknown as ConvertDateToStringType<ExtendedDbEvent>),
                persons: event.persons.map(person => person.name),
                tags: event.tags.map(tag => tag.name),
                root_folder_has_mark: await isFolderMarked({
                    rootFolderPath: event.rootFolderPath,
                }),
                has_problems:
                    (await checkEventForProblems({ event }))?.map(
                        problem => problemMap[problem] ?? problem,
                    ) || null,
            })),
        ),
    });
};

export default handleListEventsRequest;
