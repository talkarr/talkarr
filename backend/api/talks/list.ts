import { isFolderMarked } from '@backend/fs';
import { checkEventForProblems, listTalks } from '@backend/talks';
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
    const talks = await listTalks();

    res.json({
        success: true,
        data: await Promise.all(
            talks.map(async talk => ({
                ...(talk as unknown as ConvertDateToStringType<ExtendedDbEvent>),
                persons: talk.persons.map(person => person.name),
                tags: talk.tags.map(tag => tag.name),
                root_folder_has_mark: await isFolderMarked(talk.rootFolderPath),
                has_problems:
                    (await checkEventForProblems(talk))?.map(
                        problem => problemMap[problem] ?? problem,
                    ) || null,
            })),
        ),
    });
};

export default handleListEventsRequest;
