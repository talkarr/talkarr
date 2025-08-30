import type { Metadata, NextPage } from 'next';

import Typography from '@mui/material/Typography';

import InitialAccountForm from '@/app/(i18n)/welcome/start/_components/InitialAccountForm';

import { getServerSideTranslation } from '@/i18n/server-side';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.welcomeStart.title'),
    };
};

const Page: NextPage = async () => {
    const { t } = await getServerSideTranslation();

    return (
        <>
            <Typography variant="h4" textAlign="center">
                {t('pages.welcomeStart.title')}
            </Typography>
            <Typography variant="body2" textAlign="center">
                {t('pages.welcomeStart.description')}
            </Typography>
            <InitialAccountForm />
        </>
    );
};

export default Page;
