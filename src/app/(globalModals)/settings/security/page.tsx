import type { Metadata, NextPage } from 'next';

import { listUsers } from '@/app/_api/settings/security';
import UserRow from '@/app/(globalModals)/settings/security/_components/UserRow';

import MaterialTable from '@components/MaterialTable';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
    title: 'Security Settings',
};

const Page: NextPage = async () => {
    const users = await listUsers();

    const usersArray = users?.success ? users.data.users : null;

    return (
        <Box data-testid="security-settings">
            <Box>
                <Box mb={2}>
                    <Typography variant="h4">Security</Typography>
                </Box>
                <MaterialTable component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="users table">
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell size="small">Created At</TableCell>
                                <TableCell size="small">Updated At</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usersArray?.length ? (
                                usersArray.map(user => (
                                    <UserRow key={user.id} user={user} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </MaterialTable>
            </Box>
        </Box>
    );
};

export default Page;
