import type { NextPage } from 'next';

import ImportJsonField from '@/app/(globalModals)/talks/import/_components/ImportJsonField';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ImportPage: NextPage = () => (
    <Box
        sx={{
            paddingX: 4,
            paddingY: 2,
        }}
    >
        <Typography variant="h1">Import talks - Under construction</Typography>
        <Typography>Import talks from c3 Fahrplan.</Typography>
        <ImportJsonField />
    </Box>
);

export default ImportPage;
