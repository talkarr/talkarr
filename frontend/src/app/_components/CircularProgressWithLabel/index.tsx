import type { FC } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import type { CircularProgressProps } from '@mui/material';

export interface CircularProgressWithLabelProps extends CircularProgressProps {
    value: number;
    backgroundColor?: string;
}

const CircularProgressWithLabel: FC<CircularProgressWithLabelProps> = ({
    backgroundColor,
    ...props
}) => (
    <Box
        sx={{
            position: 'relative',
            display: 'inline-flex',
            backgroundColor,
            borderRadius: '50%',
        }}
    >
        <CircularProgress variant="determinate" {...props} />
        <Box
            sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Typography
                variant="caption"
                component="div"
                sx={{ color: 'text.secondary' }}
            >
                {`${Math.round(props.value)}%`}
            </Typography>
        </Box>
    </Box>
);

export default CircularProgressWithLabel;
