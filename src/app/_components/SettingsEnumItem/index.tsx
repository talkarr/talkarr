import type { FC } from 'react';
import React, { useState } from 'react';

import type { Enum } from '@backend/types';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';

export interface SettingsEnumItemProps {
    primaryText: string;
    options: Enum<unknown>;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    secondaryText?: string;
}

const SettingsEnumItem: FC<SettingsEnumItemProps> = ({
    primaryText,
    icon,
    secondaryText,
    value,
    options,
    onChange,
}) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Paper
            sx={{
                borderRadius: 2.5,
            }}
        >
            <ListItemButton
                onClick={() => {
                    setOpen(!open);
                }}
                sx={{ borderRadius: 2.5 }}
            >
                {icon ? (
                    <ListItemIcon
                        sx={{ minWidth: 'initial', marginRight: 1.5 }}
                    >
                        {icon}
                    </ListItemIcon>
                ) : null}
                <ListItemText primary={primaryText} secondary={secondaryText} />
                <Select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 120, border: 'none' }}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                >
                    {Object.entries(options).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                            {/* TODO: once translations are happening, automatically translate these values */}
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </ListItemButton>
        </Paper>
    );
};

export default SettingsEnumItem;
