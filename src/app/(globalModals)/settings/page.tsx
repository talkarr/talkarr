import type { Metadata, NextPage } from 'next';
import Link from 'next/link';

import { settings } from '@components/Navigation/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
    title: 'Settings',
};

const Page: NextPage = () => (
    <Box data-testid="settings">
        {settings.map(item => {
            const href =
                typeof item.path === 'string' ? item.path : item.path.href;
            const as = typeof item.path === 'string' ? item.path : item.path.as;

            return (
                <Box key={item.title}>
                    <Link
                        href={href}
                        as={as}
                        // eg settings-media-management
                        data-testid={`settings-${item.slug}`}
                    >
                        <Typography variant="h4">{item.title}</Typography>
                    </Link>
                    <Typography variant="body1" mt={1}>
                        {item.description}
                    </Typography>
                </Box>
            );
        })}
    </Box>
);

export default Page;
