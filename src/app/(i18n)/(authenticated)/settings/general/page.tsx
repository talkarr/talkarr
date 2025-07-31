import type { Metadata, NextPage } from 'next';

import type { SuccessData } from '@backend/types';

import { getGeneralSettings } from '@/app/_api/settings/general';
import GeneralSettingsForm from '@/app/(i18n)/(authenticated)/settings/general/_components/GeneralSettingsForm';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
    title: 'General Settings',
};

export type GeneralSettings = SuccessData<'/settings/general/config', 'get'>;

const Page: NextPage = async () => {
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
                            Failed to load general settings.
                        </Typography>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Page;
