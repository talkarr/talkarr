import {
    getProblemsByGuid,
    getTalkInfoByGuid,
    getTalkInfoBySlug,
} from '@backend/events';
import rootLog from '@backend/root-log';
import { generateMediaItemStatus } from '@backend/talk-utils';
import type { ExpressRequest, ExpressResponse, TalkInfo } from '@backend/types';
import { problemMap } from '@backend/types';
import { requireUser } from '@backend/users';

const log = rootLog.child({ label: 'talks/info' });

const handleEventInfoRequest = async (
    req: ExpressRequest<'/talks/info', 'get'>,
    res: ExpressResponse<'/talks/info', 'get'>,
): Promise<void> => {
    if (!(await requireUser(req, res))) {
        return;
    }

    const { guid, slug } = req.query;

    if (!guid && !slug) {
        log.error('guid or slug is required.');

        res.status(400).json({
            success: false,
            error: 'guid or slug is required.',
        });

        return;
    }

    let talk: Omit<TalkInfo, 'status'> | null = null;
    let guidFromSlug: string | null = null;

    if (guid) {
        const data = await getTalkInfoByGuid({ guid });
        talk = data.talkInfo;
    } else if (slug) {
        const data = await getTalkInfoBySlug({ slug });
        talk = data.talkInfo;
        guidFromSlug = data.guid;
    }

    if (!talk) {
        log.error('Talk not found.', { slug, guid });

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    const problems = await getProblemsByGuid({
        guid: guid || guidFromSlug!,
    });

    const mappedProblems =
        problems?.map(problem => problemMap[problem] ?? problem) || null;

    res.json({
        success: true,
        data: {
            ...talk,
            status: generateMediaItemStatus({
                talk: {
                    problems,
                    mapped_problems: mappedProblems,
                },
                talkInfo: {
                    files: talk.files,
                    is_downloading: talk.is_downloading,
                },
            }),
        },
    });
};

export default handleEventInfoRequest;
