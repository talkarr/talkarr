import type { NextPage } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { defaultListEventsParams, listEvents } from '@/app/_api/talks/list';

import { addTalksPageLink, mediaManagementSettingsPageLink } from '@/constants';
import { getServerSideTranslation } from '@/i18n/server-side';

import YourMediaColorExplanation from '@components/YourMediaColorExplanation';
import YourMediaGrid from '@components/YourMediaGrid';
import YourMediaPageControls from '@components/YourMediaPageControls';

const Home: NextPage<{
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}> = async ({ searchParams }) => {
    const params = await searchParams;
    const page = Number(params.page ?? '1');

    if (Number.isNaN(page) || page < 1) {
        notFound();
    }

    const { t } = await getServerSideTranslation();
    const eventsResponse = await listEvents({
        ...defaultListEventsParams,
        page,
    });
    const configResponse = await getConfig();

    const eventData = eventsResponse?.success ? eventsResponse.data : null;

    if (page > 1 && (!eventData || eventData.events.length === 0)) {
        notFound();
    }

    const hasRootFolders =
        configResponse?.success && configResponse.data.folders.length > 0;

    if (!eventData?.events.length) {
        return (
            <Box
                sx={{
                    paddingX: 4,
                    paddingY: 2,
                }}
            >
                <Box
                    mt={4}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                >
                    <Typography
                        variant="h3"
                        fontWeight="normal"
                        textAlign="center"
                    >
                        {t('pages.homePage.noMediaFound.title')}
                    </Typography>
                    <Link href={addTalksPageLink}>
                        <Button variant="contained" color="primary">
                            {t('pages.homePage.noMediaFound.buttonText')}
                        </Button>
                    </Link>
                    {hasRootFolders ? null : (
                        <Link href={mediaManagementSettingsPageLink}>
                            <Button variant="contained" color="secondary">
                                {t('pages.homePage.noRootFolders.buttonText')}
                            </Button>
                        </Link>
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                paddingX: 3,
                paddingY: 3,
            }}
        >
            <YourMediaGrid initialData={eventData.events} />
            <YourMediaPageControls initialData={eventData} />
            <YourMediaColorExplanation initialData={eventData} />
        </Box>
    );
};

// required for not to fail the build because api
export const dynamic = 'force-dynamic';

export default Home;
