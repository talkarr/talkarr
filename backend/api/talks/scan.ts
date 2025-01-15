// @ts-nocheck
import { scanForExistingFiles } from '@backend/fs/scan';
import { listRootFolders } from '@backend/rootFolder';
import type { ExpressRequest, ExpressResponse } from '@backend/types';

const handleScanEventsRequest = async (
    _req: ExpressRequest<'/talks/scan', 'get'>,
    res: ExpressResponse<'/talks/scan', 'get'>,
): Promise<void> => {
    const rootFolders = await listRootFolders();
    const files = await scanForExistingFiles(rootFolders[0]);

    res.json({
        success: true,
        data: { files, has_new_files: files.length > 0 },
    });
};

export default handleScanEventsRequest;
