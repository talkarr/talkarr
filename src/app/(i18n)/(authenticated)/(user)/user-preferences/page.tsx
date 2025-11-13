import type { Metadata, NextPage } from 'next';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import type { SuccessData } from '@backend/types';

import { getUserInfo } from '@/app/_api/user/info';
import UserPreferencesForm from '@/app/(i18n)/(authenticated)/(user)/user-preferences/_components/UserPreferencesForm';

import { getServerSideTranslation } from '@/i18n/server-side';

export type UserInfo = SuccessData<'/user/info', 'get'>;

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.userPreferencesPage.title'),
    };
};

const UserPreferencesPage: NextPage = async () => {
    const { t } = await getServerSideTranslation();

    const initialUserInfo = await getUserInfo();

    const initialData = initialUserInfo?.success ? initialUserInfo.data : null;

    return (
        <Container sx={{ ml: 0 }} maxWidth="md" disableGutters>
            <Box data-testid="general-settings">
                <Box>
                    {initialData ? (
                        <UserPreferencesForm initialData={initialData} />
                    ) : (
                        <>
                            <Box mb={2}>
                                <Typography variant="h4">General</Typography>
                            </Box>
                            <Typography variant="body1">
                                {t('errors.failedToLoadData')}
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                            >
                                {initialUserInfo?.success
                                    ? null
                                    : initialUserInfo?.error}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default UserPreferencesPage;
