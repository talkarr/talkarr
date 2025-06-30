import type { FC, PropsWithChildren } from 'react';

import Box from '@mui/material/Box';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <Box
        sx={{
            padding: { xs: 1.5, md: 3 },
            width: '100%',
        }}
    >
        {children}
    </Box>
);

export default Layout;
