'use client';

import type { FC } from 'react';

import type { BadgeProps } from '@mui/material';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const CustomBadge: FC<Omit<BadgeProps, 'children'>> = ({
    color = 'primary',
    badgeContent,
    ...rest
}) => {
    const theme = useTheme();

    const processedColor = color === 'default' ? 'primary' : color;

    const actualColor =
        processedColor in theme.palette &&
        'main' in theme.palette[processedColor]
            ? theme.palette[processedColor].main
            : processedColor;

    return (
        <Box
            borderRadius={4}
            bgcolor={actualColor}
            color={theme.palette.getContrastText(actualColor)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            paddingX={1}
            paddingY={0.5}
            height="fit-content"
            {...rest}
        >
            <Typography variant="body1" noWrap>{badgeContent}</Typography>
        </Box>
    );
};

export default CustomBadge;
