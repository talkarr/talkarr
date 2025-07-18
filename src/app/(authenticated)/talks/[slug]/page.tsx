import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';

import type { SuccessData } from '@backend/types';

import { getTalk } from '@/app/_api/talks/get';
import { talkInfo } from '@/app/_api/talks/info';
import TalkWrapper from '@/app/(authenticated)/talks/[slug]/_components/TalkWrapper';

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

export type SingleTalkData = SuccessData<'/talks/get', 'get'>;

const Page: NextPage<PageProps> = async ({ params }) => {
    // at this point, slug is guaranteed to be a string and exist in database because of notFound() above
    const { slug } = await params;

    if (typeof slug !== 'string') {
        notFound();
    }

    const response = await getTalk({ slug, guid: '' });
    const data = response?.success ? response.data : null;

    if (!data) {
        notFound();
    }

    return <TalkWrapper initialData={data} />;
};

export default Page;
