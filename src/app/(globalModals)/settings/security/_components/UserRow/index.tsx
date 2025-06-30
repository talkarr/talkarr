import type { FC } from 'react';

import type { components } from '@backend/generated/schema';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export interface UserRowProps {
    user: components['schemas']['User'];
}

const UserRow: FC<UserRowProps> = ({ user }) => (
    <TableRow>
        <TableCell component="th" scope="row">
            {user.displayName ? (
                <>
                    <Typography variant="body1">{user.displayName}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {user.email}
                    </Typography>
                </>
            ) : (
                <>{user.email}</>
            )}
        </TableCell>
        <TableCell size="small">
            {new Date(user.createdAt).toLocaleString()}
        </TableCell>
        <TableCell size="small">
            {new Date(user.updatedAt).toLocaleString()}
        </TableCell>
        <TableCell align="right">
            {/* Actions can be added here, e.g., Edit, Delete */}
            <button>Edit</button>
            <button>Delete</button>
        </TableCell>
    </TableRow>
);

export default UserRow;
