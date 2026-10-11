import type { NextPage } from 'next';

import Typography from '@mui/material/Typography';

import LoginPageForm from '@/app/(i18n)/(unauthenticated)/(userelements)/login/_components/LoginPageForm';

import { getServerSideTranslation } from '@/i18n/server-side';

const Page: NextPage = async () => {
    const { t } = await getServerSideTranslation();

    return (
        <>
            <Typography variant="h2">{t('pages.loginPage.title')}</Typography>
            <Typography variant="body1">
                {t('pages.loginPage.description')}
            </Typography>
            <LoginPageForm />
        </>
    );
};

export default Page;
