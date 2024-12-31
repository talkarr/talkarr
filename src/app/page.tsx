import Link from 'next/link';

import type { FC } from 'react';

import { addTalksPageLink, mediaManagementSettingsPageLink } from '@/constants';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Home: FC = () => (
    <div>
        <main>
            <Box
                mt={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
            >
                <Typography variant="h3" fontWeight="normal" textAlign="center">
                    You do not have any media yet!
                </Typography>
                <Link href={addTalksPageLink}>
                    <Button variant="contained" color="primary">
                        Go add some media!
                    </Button>
                </Link>
                <Link href={mediaManagementSettingsPageLink}>
                    <Button variant="contained" color="secondary">
                        Go to media management settings
                    </Button>
                </Link>
            </Box>
        </main>
    </div>
);

export default Home;
