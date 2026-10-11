import type { Metadata, NextPage } from 'next';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { getServerSideTranslation } from '@/i18n/server-side';

import { settings } from '@components/Navigation/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
    const { t } = await getServerSideTranslation();

    return {
        title: t('pages.settingsPage.title'),
    };
};

const Page: NextPage = async () => {
    const { t } = await getServerSideTranslation();

    return (
        <Box
            data-testid="settings"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            {settings.map(item => {
                const href =
                    typeof item.path === 'string' ? item.path : item.path.href;
                const as =
                    typeof item.path === 'string' ? item.path : item.path.as;

                return (
                    <Box key={item.title}>
                        <Link
                            href={href}
                            as={as}
                            // eg settings-media-management
                            data-testid={`settings-${item.slug}`}
                            style={{
                                textDecoration: 'underline',
                                textDecorationColor: 'white',
                                textDecorationThickness: '2px',
                            }}
                        >
                            <Typography variant="h4">
                                {t(item.title)}
                            </Typography>
                        </Link>
                        <Typography
                            variant="body1"
                            sx={{
                                mt: 1,
                            }}
                        >
                            {t(item.description)}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

export default Page;
