import Link from 'next/link';

import type { FC } from 'react';

import { listEvents } from '@/app/_api/talks/list';

import { addTalksPageLink, mediaManagementSettingsPageLink } from '@/constants';

import YourMediaGrid from '@components/YourMediaGrid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Home: FC = async () => {
    const eventsResponse = await listEvents();

    const events = eventsResponse?.success ? eventsResponse.data : null;

    if (!events?.length) {
        return (
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
        );
    }

    return <YourMediaGrid initialData={events} />;
};

export default Home;
