import type { NextPage } from 'next';
import { notFound } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { getUserDetails } from '@/app/_api/user/details';
import UserDetailsInformation from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsInformation';
import UserDetailsPermissions from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsPermissions';

import UserAvatar from '@components/UserAvatar';

interface PageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page: NextPage<PageProps> = async ({ params }) => {
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
                        <UserDetailsPermissions user={data} />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Page;
