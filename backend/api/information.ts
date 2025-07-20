import { execSync } from 'node:child_process';

import rootLog from '@backend/root-log';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const log = rootLog.child({ label: 'informationHandler' });

const getYtdlpVersion = (): string => {
    try {
        return execSync('yt-dlp --version', { encoding: 'utf8' }).trim();
    } catch {
        return 'unknown';
    }
};

const informationHandler = async (
    _req: ExpressRequest<'/information', 'get'>,
    res: ExpressResponse<'/information', 'get'>,
): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            data: {
                ytdlpVersion: getYtdlpVersion(),
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
