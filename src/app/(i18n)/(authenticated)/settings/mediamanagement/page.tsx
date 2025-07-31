import type { Metadata, NextPage } from 'next';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import AddFolderButton from '@/app/(i18n)/(authenticated)/settings/mediamanagement/_components/AddFolderButton';
import FolderRow from '@/app/(i18n)/(authenticated)/settings/mediamanagement/_components/FolderRow';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
    title: 'Mediamanagement Settings',
};

const Page: NextPage = async () => {
    const config = await getConfig();

    const data = config?.success ? config.data : null;

    return (
        <Box data-testid="media-management-settings">
            <Box>
                <Typography variant="h4">Root Folders</Typography>
                <Typography variant="body1">
                    Root folders are the base directories where media files are
                    stored.
                </Typography>
                <Table
                    sx={{
                        // Thanks to Google Chrome for being such a nice browser
                        tableLayout: 'fixed',
                        maxWidth: '100%',

                        // set word-wrap for all inner td elements
                        '& td': {
                            wordWrap: 'break-word',
                        },
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell>Folder</TableCell>
                            <TableCell>Free Space</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.folders.map(folderData => (
                            <FolderRow
                                folderData={folderData}
                                key={folderData.folder}
                            />
                        ))}
                        {data?.folders.length === 0 ? (
                            <TableRow data-testid="no-root-folder">
                                <TableCell colSpan={4}>
                                    No root folders have been configured.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
                <Box mt={2}>
                    <AddFolderButton />
                </Box>
            </Box>
        </Box>
    );
};

export default Page;
