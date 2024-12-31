import type { Metadata, NextPage } from 'next';

import { getConfig } from '@/app/_api/settings/mediamanagement';
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

    return <AddTalksPage hasRootFolder={!!data?.folders.length} />;
};

export default Page;
