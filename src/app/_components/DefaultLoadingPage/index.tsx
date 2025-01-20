import type { FC } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const DefaultLoadingPage: FC = () => (
    <Box
        position="fixed"
        top="50%"
        left="50%"
        display="flex"
        justifyContent="center"
        alignItems="center"
    >
        <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress />
            <Typography variant="h6" mt={1}>
                Loading...
            </Typography>
        </Box>
    </Box>
);

export default DefaultLoadingPage;
