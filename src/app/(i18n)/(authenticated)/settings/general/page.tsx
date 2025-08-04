import type { Metadata, NextPage } from 'next';

import type { SuccessData } from '@backend/types';

import { getGeneralSettings } from '@/app/_api/settings/general';
import GeneralSettingsForm from '@/app/(i18n)/(authenticated)/settings/general/_components/GeneralSettingsForm';

import { getServerSideTranslation } from '@/i18n/server-side';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.generalSettingsPage.title'),
    };
};

export type GeneralSettings = SuccessData<'/settings/general/config', 'get'>;

const Page: NextPage = async () => {
    const { t } = await getServerSideTranslation();

    const initialGeneralSettings = await getGeneralSettings();

    const initialData = initialGeneralSettings?.success
        ? initialGeneralSettings.data
        : null;

    return (
        <Box data-testid="general-settings">
            <Box>
                {initialData ? (
                    <GeneralSettingsForm initialData={initialData} />
                ) : (
                    <>
                        <Box mb={2}>
                            <Typography variant="h4">General</Typography>
                        </Box>
                        <Typography variant="body1">
                            {t('errors.failedToLoadData')}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                            {initialGeneralSettings?.success
                                ? null
                                : initialGeneralSettings?.error}
                        </Typography>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Page;
