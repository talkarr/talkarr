import type { FC, PropsWithChildren } from 'react';

import Box from '@mui/material/Box';

const Layout: FC<PropsWithChildren> = ({ children }) => (
    <Box
        sx={{
            paddingX: 4,
            paddingY: 2,
            width: '100%',
        }}
    >
        {children}
    </Box>
);

export default Layout;
