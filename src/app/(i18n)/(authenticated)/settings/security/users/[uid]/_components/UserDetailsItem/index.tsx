import type { FC, ReactElement } from 'react';

import ListItem from '@mui/material/ListItem';
import type { ListItemTextProps } from '@mui/material/ListItemText';
import ListItemText from '@mui/material/ListItemText';

export interface UserDetailsItemProps {
    primary: ListItemTextProps['primary'];
    secondary?: ListItemTextProps['secondary'];
    slotProps?: ListItemTextProps['slotProps'];
    icon?: ReactElement;
}

const UserDetailsItem: FC<UserDetailsItemProps> = ({
    primary,
    secondary,
    slotProps,
    icon,
}) => (
    <ListItem>
        <ListItemText
            primary={primary}
            secondary={secondary}
            slotProps={slotProps}
        />
        {icon || null}
    </ListItem>
);

export default UserDetailsItem;
