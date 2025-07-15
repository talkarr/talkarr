import type { Metadata, NextPage } from 'next';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { listEvents } from '@/app/_api/talks/list';
import AddTalksPage from '@/app/(authenticated)/(globalModals)/talks/add/_components/AddTalksPage';

import Box from '@mui/material/Box';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const generateMetadata = async ({
    searchParams,
}: PageProps): Promise<Metadata> => {
    const { search } = await searchParams;
    return {
        title: `${search ? `${search} | ` : ''}Add Talk`,
    };
};

const AddTalkPage: NextPage<PageProps> = async () => {
    const config = await getConfig();

    const data = config?.success ? config.data : null;

    const eventsResponse = await listEvents();

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
                events={eventsData?.events || null}
            />
        </Box>
    );
};

export default AddTalkPage;
