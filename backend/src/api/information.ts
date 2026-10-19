import { getAppVersion, getIsNightly, getYtdlpVersion } from '@backend/env';
import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'informationHandler' });

const informationHandler = async (
    _req: ExpressRequest<'/information', 'get'>,
    res: ExpressResponse<'/information', 'get'>,
): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            data: {
                ytdlpVersion: getYtdlpVersion(),
                appVersion: getAppVersion(),
                isNightly: getIsNightly(),
            },
        });
        return;
    } catch (error) {
        log.error('Failed to retrieve information', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve information',
        });
        return;
    }
};

export default informationHandler;
