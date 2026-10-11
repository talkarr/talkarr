import type { Metadata, NextPage } from 'next';

import Box from '@mui/material/Box';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { basicListEvents } from '@/app/_api/talks/basic-list';
import AddTalksPage from '@/app/(i18n)/(authenticated)/talks/add/_components/AddTalksPage';

import { getServerSideTranslation } from '@/i18n/server-side';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const generateMetadata = async ({
    searchParams,
}: PageProps): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();
    const { search } = await searchParams;
    return {
        title: `${search ? `${search} | ` : ''}${t('pages.addTalksPage.title')}`,
    };
};

const Page: NextPage<PageProps> = async () => {
    const config = await getConfig();

    const data = config?.success ? config.data : null;

    const eventsResponse = await basicListEvents();

    const eventsData = eventsResponse?.success ? eventsResponse.data : null;

    return (
        <Box
            sx={{
                paddingX: 4,
                paddingY: 2,
            }}
        >
            <AddTalksPage
                hasRootFolder={!!data?.folders.length}
                events={eventsData || null}
            />
        </Box>
    );
};

export default Page;
