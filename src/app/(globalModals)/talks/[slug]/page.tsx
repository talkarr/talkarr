import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';

import { talkInfo } from '@/app/_api/talks/info';

interface PageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const generateMetadata = async ({
    params,
}: PageProps): Promise<Metadata> => {
    const { slug } = await params;

    if (typeof slug === 'string') {
        const info = await talkInfo({ slug, guid: '' });

        if (!info || !info.success) {
            notFound();
        }

        const { title } = info.data;

        return {
            title,
        };
    }

    return {
        title: 'Talks',
    };
};

const Page: NextPage<PageProps> = async ({ params }) => {
    // at this point, slug is guaranteed to be a string and exist in database because of notFound() above
    const { slug } = await params;

    return <div>{slug}</div>;
};

export default Page;
