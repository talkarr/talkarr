import type { Metadata, NextPage } from 'next';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import AddFolderButton from '@/app/(i18n)/(authenticated)/settings/mediamanagement/_components/AddFolderButton';
import FolderRow from '@/app/(i18n)/(authenticated)/settings/mediamanagement/_components/FolderRow';

import { getServerSideTranslation } from '@/i18n/server-side';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.mediaManagementSettingsPage.title'),
    };
};

const Page: NextPage = async () => {
    const config = await getConfig();

    const { t } = await getServerSideTranslation();

    const data = config?.success ? config.data : null;

    return (
        <Box data-testid="media-management-settings">
            <Box>
                <Typography variant="h4">
                    {t('pages.mediaManagementSettingsPage.rootFolders.title')}
                </Typography>
                <Typography variant="body1">
                    {t(
                        'pages.mediaManagementSettingsPage.rootFolders.description',
                    )}
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
                            <TableCell>
                                {t(
                                    'pages.mediaManagementSettingsPage.rootFolders.columns.folderName',
                                )}
                            </TableCell>
                            <TableCell>
                                {t(
                                    'pages.mediaManagementSettingsPage.rootFolders.columns.freeSpace',
                                )}
                            </TableCell>
                            <TableCell align="right">
                                {t(
                                    'pages.mediaManagementSettingsPage.rootFolders.columns.actions',
                                )}
                            </TableCell>
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
                                    {t(
                                        'pages.mediaManagementSettingsPage.rootFolders.noRootFoldersConfigured',
                                    )}
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
