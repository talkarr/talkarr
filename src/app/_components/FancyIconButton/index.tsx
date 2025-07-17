'use client';

import type { IconButtonProps } from '@mui/material';

import type { FC } from 'react';
import { useMemo } from 'react';

import { alpha, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';

const alphaFactor = 0.175; // 17.5% alpha

const FancyIconButton: FC<IconButtonProps> = props => {
    const theme = useTheme();

    const actualColor = useMemo(() => {
        if (!props.color) {
            return theme.palette.primary.main;
        }

        if (props.color === 'inherit') {
            return theme.palette.text.primary;
        }

        if (props.color === 'default') {
            return alpha(theme.palette.action.active, alphaFactor);
        }

        return alpha(theme.palette[props.color].main, alphaFactor);
    }, [props.color, theme.palette]);

    return (
        <IconButton
            {...props}
            sx={{
                ...props.sx,
                backgroundColor: actualColor,
            }}
        />
    );
};

export default FancyIconButton;
