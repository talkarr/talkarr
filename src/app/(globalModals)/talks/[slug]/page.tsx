import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';

import { getTalk } from '@/app/_api/talks/get';
import { talkInfo } from '@/app/_api/talks/info';
import TalkHeader from '@/app/(globalModals)/talks/[slug]/_components/TalkHeader';

import type { SuccessData } from '@backend/types';
import Box from '@mui/material/Box';

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

    return (
        <Box display="flex" flexDirection="column" gap={1} width="100%">
            <Box flex={1}>
                <TalkHeader data={data} />
            </Box>
            <Box bgcolor="blue" flex={1} />
        </Box>
    );
};

export default Page;
