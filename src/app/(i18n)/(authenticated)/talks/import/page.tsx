import type { Metadata, NextPage } from 'next';

import Box from '@mui/material/Box';

import ImportJsonField from '@/app/(i18n)/(authenticated)/talks/import/_components/ImportJsonField';

import { getServerSideTranslation } from '@/i18n/server-side';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.importJsonPage.title'),
    };
};

const Page: NextPage = () => (
    <Box
        sx={{
            paddingX: 4,
            paddingY: 2,
        }}
    >
        <ImportJsonField />
    </Box>
);

export default Page;
