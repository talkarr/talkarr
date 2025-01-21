import rootLog from '@backend/rootLog';
import { getTalkInfoByGuid, getTalkInfoBySlug } from '@backend/talks';
import type { ExpressRequest, ExpressResponse, TalkInfo } from '@backend/types';

const log = rootLog.child({ label: 'talks/info' });

const handleEventInfoRequest = async (
    req: ExpressRequest<'/talks/info', 'get'>,
    res: ExpressResponse<'/talks/info', 'get'>,
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

    let talk: TalkInfo | null = null;

    if (guid) {
        talk = await getTalkInfoByGuid(guid);
    } else if (slug) {
        talk = await getTalkInfoBySlug(slug);
    }

    if (!talk) {
        log.error('Talk not found.', { slug, guid });

        res.status(404).json({
            success: false,
            error: 'Talk not found.',
        });

        return;
    }

    res.json({
        success: true,
        data: talk,
    });
};

export default handleEventInfoRequest;
