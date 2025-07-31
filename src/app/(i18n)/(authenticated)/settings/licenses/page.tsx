import type { NextPage } from 'next';

import { appbarHeight } from '@/constants';

import LicenseViewer from '@components/LicenseViewer';

const Page: NextPage = () => (
    <LicenseViewer scrollBoxHeight={`calc(100vh - ${appbarHeight}px - 48px)`} />
);

export default Page;
