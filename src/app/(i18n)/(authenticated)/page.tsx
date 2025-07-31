import Link from 'next/link';

import type { FC } from 'react';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import { listEvents } from '@/app/_api/talks/list';

import { addTalksPageLink, mediaManagementSettingsPageLink } from '@/constants';

import YourMediaColorExplanation from '@components/YourMediaColorExplaination';
import YourMediaGrid from '@components/YourMediaGrid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Home: FC = async () => {
    const eventsResponse = await listEvents();
    const configResponse = await getConfig();

    const eventData = eventsResponse?.success ? eventsResponse.data : null;

    const hasRootFolders =
        configResponse?.success && configResponse.data.folders.length > 0;

    if (!eventData?.events.length) {
        return (
            <Box
                sx={{
                    paddingX: 4,
                    paddingY: 2,
                }}
            >
                <Box
                    mt={4}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                >
                    <Typography
                        variant="h3"
                        fontWeight="normal"
                        textAlign="center"
                    >
                        You do not have any media yet!
                    </Typography>
                    <Link href={addTalksPageLink}>
                        <Button variant="contained" color="primary">
                            Go add some media!
                        </Button>
                    </Link>
                    {hasRootFolders ? null : (
                        <Link href={mediaManagementSettingsPageLink}>
                            <Button variant="contained" color="secondary">
                                Go to media management settings
                            </Button>
                        </Link>
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                paddingX: 3,
                paddingY: 3,
            }}
        >
            <YourMediaGrid initialData={eventData.events} />
            <YourMediaColorExplanation
                initialStatusCount={eventData.statusCount}
                initialData={eventData.events}
            />
        </Box>
    );
};

// required for not to fail the build because api
export const dynamic = 'force-dynamic';

export default Home;
