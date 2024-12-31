import type { Metadata, NextPage } from 'next';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { listEvents } from '@/app/_api/talks/list';
import AddTalksPage from '@/app/(globalModals)/talks/add/_components/AddTalksPage';

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

const Page: NextPage<PageProps> = async () => {
    const config = await getConfig();

    const data = config?.success ? config.data : null;

    const eventsResponse = await listEvents();

    const events = eventsResponse?.success ? eventsResponse.data : null;

    return (
        <AddTalksPage hasRootFolder={!!data?.folders.length} events={events} />
    );
};

export default Page;
