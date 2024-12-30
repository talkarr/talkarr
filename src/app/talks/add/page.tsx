import type { Metadata } from 'next';

import type { FC } from 'react';

import AddTalksPage from '@/app/talks/add/_components/AddTalksPage';

export const metadata: Metadata = {
    title: 'Add Talk',
};

const Page: FC = () => <AddTalksPage />;

export default Page;
