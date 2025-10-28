import type { FC } from 'react';

import ListItem from '@mui/material/ListItem';
import type { ListItemTextProps } from '@mui/material/ListItemText';
import ListItemText from '@mui/material/ListItemText';

export interface UserDetailsItemProps {
    primary: ListItemTextProps['primary'];
    secondary?: ListItemTextProps['secondary'];
}

const UserDetailsItem: FC<UserDetailsItemProps> = ({ primary, secondary }) => (
    <ListItem>
        <ListItemText primary={primary} secondary={secondary} />
    </ListItem>
);

export default UserDetailsItem;
