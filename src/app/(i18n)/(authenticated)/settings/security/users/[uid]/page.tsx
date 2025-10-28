import type { NextPage } from 'next';
import { notFound } from 'next/navigation';

import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import LockIcon from '@mui/icons-material/Lock';

import { getUserDetails } from '@/app/_api/user/details';
import UserDetailsCard from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsCard';
import UserDetailsInformation from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsInformation';
import UserDetailsItem from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsItem';

import { getServerSideTranslation } from '@/i18n/server-side';

import UserAvatar from '@components/UserAvatar';

interface PageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page: NextPage<PageProps> = async ({ params }) => {
    const { t } = await getServerSideTranslation();
    const { uid } = await params;

    if (typeof uid !== 'string') {
        notFound();
    }

    const response = await getUserDetails({ uid });
    const data = response?.success ? response.data : null;

    if (!data) {
        notFound();
    }

    return (
        <Container>
            <Box display="flex" flexDirection="column" gap={4}>
                <Box
                    display="flex"
                    flexDirection="row"
                    gap={1}
                    alignItems="center"
                >
                    <UserAvatar user={data} />
                    <Typography variant="h3">
                        {data.displayName || data.email}
                    </Typography>
                </Box>
                <Grid container spacing={2} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <UserDetailsInformation user={data} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <UserDetailsCard>
                            <CardHeader
                                avatar={<LockIcon />}
                                title={t('pages.userDetailsPage.permissions')}
                            />
                            <CardContent>
                                <List>
                                    {data.permissions.map(permission => (
                                        <UserDetailsItem
                                            key={permission}
                                            primary={permission}
                                        />
                                    ))}
                                </List>
                            </CardContent>
                        </UserDetailsCard>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Page;
