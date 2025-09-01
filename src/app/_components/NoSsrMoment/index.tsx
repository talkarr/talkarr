import dynamic from 'next/dynamic';

import Skeleton from '@mui/material/Skeleton';

const NoSsrMoment = dynamic(() => import('./components/InternalNoSsrMoment'), {
    ssr: false,
    loading: () => (
        <Skeleton
            variant="rectangular"
            sx={theme => ({
                height: theme.typography.body1.fontSize,
                maxWidth: 'min(100%, 200px)',
                width: 200,
                borderRadius: 4,
            })}
        />
    ),
});

export default NoSsrMoment;
