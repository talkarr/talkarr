import Link from 'next/link';

import type { FC } from 'react';

import { homePageLink, pageName } from '@/constants';

import Logo from '@components/Logo';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface LogoWithTextProps {
    redirectToHome?: boolean;
}

const LogoWithText: FC<LogoWithTextProps> = ({ redirectToHome }) =>
    redirectToHome ? (
        <Link href={homePageLink}>
            <Button fullWidth sx={{ borderRadius: 0, p: 0 }}>
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <Logo />
                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight="bold"
                        style={{ textTransform: 'none' }}
                    >
                        {pageName}
                    </Typography>
                </Box>
            </Button>
        </Link>
    ) : (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            <Logo />
            <Typography variant="h3" component="h1" fontWeight="bold">
                {pageName}
            </Typography>
        </Box>
    );

export default LogoWithText;
