import type { NextPage } from 'next';

import ImportJsonField from '@/app/(i18n)/(authenticated)/talks/import/_components/ImportJsonField';

import Box from '@mui/material/Box';

const ImportPage: NextPage = () => (
    <Box
        sx={{
            paddingX: 4,
            paddingY: 2,
        }}
    >
        <ImportJsonField />
    </Box>
);

export default ImportPage;
