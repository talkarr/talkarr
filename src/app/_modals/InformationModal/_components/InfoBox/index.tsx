import Link from 'next/link';

import type { FC } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export interface InfoBoxProps {
    primaryText: string;
    secondaryText: string;
    href?: string;
}

const InfoBox: FC<InfoBoxProps> = ({ primaryText, secondaryText, href }) => (
    <Grid size={6}>
        <Typography variant="h6" color="primary.light">
            {primaryText}
        </Typography>
        {href ? (
            <Link href={href} target="_blank" rel="noopener noreferrer">
                <Typography variant="body2">{secondaryText}</Typography>
            </Link>
        ) : (
            <Typography variant="body2">{secondaryText}</Typography>
        )}
    </Grid>
);

export default InfoBox;
