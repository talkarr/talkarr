import type { Metadata, NextPage } from 'next';

import { listUsers } from '@/app/_api/settings/security';
import UserRow from '@/app/(i18n)/(authenticated)/settings/security/_components/UserRow';

import { getServerSideTranslation } from '@/i18n/server-side';

import MaterialTable from '@components/MaterialTable';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.securitySettingsPage.title'),
    };
};

const Page: NextPage = async () => {
    const { t } = await getServerSideTranslation();
    const users = await listUsers();

    const usersArray = users?.success ? users.data.users : null;

    return (
        <Box data-testid="security-settings">
            <Box>
                <Box mb={2}>
                    <Typography variant="h4">
                        {t('pages.securitySettingsPage.title')}
                    </Typography>
                </Box>
                <MaterialTable component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="users table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {t(
                                        'pages.securitySettingsPage.columns.user',
                                    )}
                                </TableCell>
                                <TableCell size="small">
                                    {t(
                                        'pages.securitySettingsPage.columns.createdAt',
                                    )}
                                </TableCell>
                                <TableCell size="small">
                                    {t(
                                        'pages.securitySettingsPage.columns.updatedAt',
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    {t(
                                        'pages.securitySettingsPage.columns.actions',
                                    )}
                                </TableCell>
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
                                        {t(
                                            'pages.securitySettingsPage.noUsersFound',
                                        )}
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
