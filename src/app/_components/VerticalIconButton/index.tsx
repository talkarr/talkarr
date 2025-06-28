'use client';

import type { ButtonBaseProps } from '@mui/material';

import type React from 'react';
import type { FC } from 'react';

import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

export interface VerticalIconButtonProps
    extends Omit<ButtonBaseProps, 'children'> {
    icon: React.ReactNode;
    children: string;
    square?: boolean;
}

const StyledButtonBase = styled(ButtonBase)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius * 2,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.primary.main,
    },
    '&:focus': {
        backgroundColor: theme.palette.action.focus,
        color: theme.palette.primary.main,
    },
    '&:active': {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.primary.main,
    },
    transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shortest,
    }),
}));

const VerticalIconButton: FC<VerticalIconButtonProps> = ({
    icon,
    children,
    square = false,
    ...props
}) => (
    <StyledButtonBase
        {...props}
        sx={{
            aspectRatio: square ? 1 : undefined,
            width: square ? '54px' : undefined,
            ...props.sx,
        }}
        tabIndex={props.tabIndex ?? 0}
    >
        <Box display="flex" flexDirection="column" alignItems="center">
            {icon}
            <Typography variant="caption">{children}</Typography>
        </Box>
    </StyledButtonBase>
);

export default VerticalIconButton;
