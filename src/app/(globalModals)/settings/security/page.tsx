import type { Metadata, NextPage } from 'next';

import { listUsers } from '@/app/_api/settings/security';
import UserRow from '@/app/(globalModals)/settings/security/_components/UserRow';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export const metadata: Metadata = {
    title: 'Security Settings',
};

const Page: NextPage = async () => {
    const users = await listUsers();

    const usersArray = users?.success ? users.data.users : null;

    return (
        <>
            <TableContainer component={Paper}>
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
            </TableContainer>
        </>
    );
};

export default Page;
