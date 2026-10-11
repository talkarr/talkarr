import type { NextPage } from 'next';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { welcomeStartPageLink } from '@/constants';
import { getServerSideTranslation } from '@/i18n/server-side';

const Page: NextPage = async () => {
    const { t } = await getServerSideTranslation();

    return (
        <Box
            data-testid="welcome-page"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                minWidth: 350,
                padding: { xs: 2, lg: 0 },
            }}
        >
            <Typography
                variant="h3"
                sx={{
                    textAlign: 'center',
                }}
            >
                {t('pages.welcomePage.title')}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    textAlign: 'center',
                }}
            >
                {t('pages.welcomePage.description')}
            </Typography>
            <Box
                sx={{
                    mt: 2,
                    width: { xs: '100%', lg: '66%' },
                }}
            >
                <Link href={welcomeStartPageLink}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        endIcon="🎉"
                        data-testid="welcome-get-started-button"
                    >
                        {t('pages.welcomePage.getStarted')}
                    </Button>
                </Link>
            </Box>
        </Box>
    );
};

export default Page;
