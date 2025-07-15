import type { FC, PropsWithChildren } from 'react';

import { pageName } from '@/constants';

import Logo from '@components/Logo';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const SetupScreenWrapper: FC<PropsWithChildren> = ({ children }) => (
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
                minWidth: '400px',
                minHeight: '300px',
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
                flexDirection="row"
                gap={{ lg: 4 }}
                alignItems="center"
                flexWrap="wrap"
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
                            {pageName}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            fontWeight="normal"
                            textAlign="center"
                        >
                            A tool helping you download all your favorite talks
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
                    gap={{ xs: 0, lg: 2 }}
                >
                    {children}
                </Box>
            </Box>
        </Paper>
    </Box>
);

export default SetupScreenWrapper;
