import type { NextPage } from 'next';
import Link from 'next/link';

import { pageName, welcomeStartPageLink } from '@/constants';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Page: NextPage = () => (
    <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        width="100%"
        minWidth={350}
        padding={{ xs: 2, lg: 0 }}
    >
        <Typography variant="h3" textAlign="center">
            Welcome to {pageName}
        </Typography>
        <Typography variant="body1" textAlign="center">
            Please setup your admin account here. As this does not require
            authentication, do not expose this to the internet.
        </Typography>
        <Box sx={{ width: { xs: '100%', lg: '66%' } }} mt={2}>
            <Link href={welcomeStartPageLink}>
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    endIcon="🎉"
                >
                    Get Started
                </Button>
            </Link>
        </Box>
    </Box>
);

export default Page;
