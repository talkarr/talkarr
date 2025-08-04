import type { Metadata, NextPage } from 'next';

import { appbarHeight } from '@/constants';
import { getServerSideTranslation } from '@/i18n/server-side';

import LicenseViewer from '@components/LicenseViewer';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.licenseSettingsPage.title'),
    };
};

const Page: NextPage = () => (
    <LicenseViewer scrollBoxHeight={`calc(100vh - ${appbarHeight}px - 48px)`} />
);

export default Page;
