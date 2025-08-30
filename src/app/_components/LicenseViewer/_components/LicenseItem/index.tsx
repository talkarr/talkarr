'use client';

import type { License } from '@components/LicenseViewer';

import type { FC } from 'react';

import { useTheme } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { useUiStore } from '@/providers/ui-store-provider';

export interface LicenseItemProps {
    license: License;
}

const LicenseItem: FC<LicenseItemProps> = ({ license }) => {
    const theme = useTheme();
    const openLicense = useUiStore(store => store.setLicenseSelected);
    const isSelected = useUiStore(
        store =>
            store.licenseSelected?.name === license.name &&
            store.licenseSelected?.version === license.version,
    );

    return (
        <ListItem
            disablePadding
            sx={{
                borderRadius: 3,
                backgroundColor: isSelected ? 'primary.main' : 'transparent',
                transition: theme.transitions.create('background-color', {
                    duration: theme.transitions.duration.short,
                }),
            }}
        >
            <ListItemButton
                sx={{
                    borderRadius: 3,
                }}
                onClick={() => openLicense(license)}
            >
                <ListItemText
                    primary={license.name}
                    secondary={`${license.version} - ${license.license}`}
                />
            </ListItemButton>
        </ListItem>
    );
};

export default LicenseItem;
