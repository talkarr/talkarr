import type { Metadata, NextPage } from 'next';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import AddFolderButton from '@/app/(globalModals)/settings/mediamanagement/_components/AddFolderButton';
import FolderRow from '@/app/(globalModals)/settings/mediamanagement/_components/FolderRow';

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
                <Typography variant="h3">Root Folders</Typography>
                <Typography variant="body1">
                    Root folders are the base directories where media files are
                    stored.
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Folder</TableCell>
                            <TableCell>Free Space</TableCell>
                            <TableCell align="right" style={{ width: 200 }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.folders.map(({ folder, free_space }) => (
                            <FolderRow
                                folder={folder}
                                freeSpace={free_space}
                                key={folder}
                            />
                        ))}
                        {data?.folders.length === 0 ? (
                            <TableRow data-testid="no-root-folder">
                                <TableCell colSpan={3}>
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
