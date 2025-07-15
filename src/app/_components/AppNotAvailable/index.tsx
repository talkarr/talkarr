import type { FC } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AppNotAvailable: FC = () => (
    <Box>
        <Typography>
            The application is currently unavailable. Please try again later.
        </Typography>
    </Box>
);

export default AppNotAvailable;
