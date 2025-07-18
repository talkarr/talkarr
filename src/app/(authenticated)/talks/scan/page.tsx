import type { NextPage } from 'next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ScanPage: NextPage = () => (
    <Box
        sx={{
            paddingX: 4,
            paddingY: 2,
        }}
    >
        <Typography variant="h1">Scan files - Under construction</Typography>
        <Typography>
            Scan root folders for files that are not yet added
        </Typography>
    </Box>
);

export default ScanPage;
