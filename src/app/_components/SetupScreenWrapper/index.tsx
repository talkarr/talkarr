'use client';

import type { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@components/Logo';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const SetupScreenWrapper: FC<PropsWithChildren> = ({ children }) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Paper
                sx={{
                    borderRadius: { xs: 0, lg: 12 },
                    boxShadow: { xs: 0, lg: 4 },
                    padding: { xs: 0, lg: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: { lg: '400px' },
                    minHeight: { lg: '300px' },
                    maxWidth: { xs: '100vw', lg: '80vw' },
                    maxHeight: { xs: '100vh', lg: '80vh' },
                    height: '100%',
                    width: { xs: '100%', lg: 'auto' },
                    aspectRatio: { lg: '3 / 2' },
                    overflow: 'hidden',
                }}
            >
                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', lg: 'row' }}
                    gap={{ lg: 4 }}
                    alignItems="center"
                    flexWrap="wrap"
                    width={{ xs: '100%', lg: 'auto' }}
                >
                    <Box
                        flex={1}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Logo height={200} width={200} />
                        <Box
                            display={{ xs: 'none', lg: 'flex' }}
                            flexDirection="column"
                        >
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                textAlign="center"
                            >
                                {t('application.name')}
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                fontWeight="normal"
                                textAlign="center"
                            >
                                {t('application.description')}
                            </Typography>
                        </Box>
                    </Box>
                    <Divider
                        flexItem
                        orientation="vertical"
                        sx={{ display: { xs: 'none', lg: 'flex' } }}
                    />
                    <Box
                        flex={1}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={{ lg: 2 }}
                        width={{ xs: '100%', lg: 'auto' }}
                    >
                        {children}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default SetupScreenWrapper;
