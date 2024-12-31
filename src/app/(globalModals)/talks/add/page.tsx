import type { Metadata } from 'next';

import type { FC } from 'react';

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

const Page: FC<PageProps> = () => <AddTalksPage />;

export default Page;
