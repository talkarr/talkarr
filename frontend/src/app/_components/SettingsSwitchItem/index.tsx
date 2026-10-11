import type { FC } from 'react';
import React from 'react';

import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';

export interface SettingsSwitchItemProps {
    primaryText: string;
    onClick: () => void;
    icon?: React.ReactNode;
    secondaryText?: string;
    children?: (onClick: () => void) => React.ReactNode;
}

const SettingsSwitchItem: FC<SettingsSwitchItemProps> = ({
    primaryText,
    onClick,
    icon,
    secondaryText,
    children,
}) => (
    <Paper sx={{ borderRadius: 2.5 }}>
        <ListItemButton onClick={onClick} sx={{ borderRadius: 2.5 }}>
            {icon ? (
                <ListItemIcon sx={{ minWidth: 'initial', marginRight: 1.5 }}>
                    {icon}
                </ListItemIcon>
            ) : null}
            <ListItemText primary={primaryText} secondary={secondaryText} />
            {children ? <Box>{children(onClick)}</Box> : null}
        </ListItemButton>
    </Paper>
);

export default SettingsSwitchItem;
