import {
    checkEventForProblems,
    getTalkInfoByGuid,
    getTalkInfoBySlug,
} from '@backend/events';
import rootLog from '@backend/rootLog';
import { generateMediaItemStatus } from '@backend/talkUtils';
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

    if (guid) {
        talk = await getTalkInfoByGuid({ guid });
    } else if (slug) {
        talk = await getTalkInfoBySlug({ slug });
    }

    if (!talk) {
        log.error('Talk not found.', { slug, guid });

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    const hasProblems =
        (
            await checkEventForProblems({
                rootFolderPath: talk.root_folder,
                downloadError: talk.download_error,
            })
        )?.map(problem => problemMap[problem] ?? problem) || null;

    res.json({
        success: true,
        data: {
            ...talk,
            status: generateMediaItemStatus({
                talk: {
                    has_problems: hasProblems,
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
