import type { FC } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

const Loading: FC = () => (
    <Box
        sx={{
            paddingX: 3,
            paddingY: 3,
        }}
    >
        <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={index}>
                    <Skeleton
                        variant="rounded"
                        width="100%"
                        height={200}
                        sx={{ borderRadius: 3 }}
                    />
                </Grid>
            ))}
        </Grid>
    </Box>
);

export default Loading;
