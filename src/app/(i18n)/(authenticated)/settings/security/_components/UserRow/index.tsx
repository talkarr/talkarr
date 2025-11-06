import Link from 'next/link';

import type { FC } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import VisibilityIcon from '@mui/icons-material/Visibility';

import type { components } from '@backend/generated/schema';

import { specificUserSecurityPageLink } from '@/constants';

import UserAvatar from '@components/UserAvatar';

export interface UserRowProps {
    user: components['schemas']['User'];
}

const UserRow: FC<UserRowProps> = ({ user }) => (
    <TableRow>
        <TableCell component="th" scope="row">
            <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
                <UserAvatar user={user} />
                <Box>
                    {user.displayName ? (
                        <>
                            <Typography variant="body1">
                                {user.displayName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {user.email}
                            </Typography>
                        </>
                    ) : (
                        <>{user.email}</>
                    )}
                </Box>
            </Box>
        </TableCell>
        <TableCell size="small">
            {new Date(user.createdAt).toLocaleString()}
        </TableCell>
        <TableCell size="small">
            {new Date(user.updatedAt).toLocaleString()}
        </TableCell>
        <TableCell align="right">
            <Link href={specificUserSecurityPageLink(user.id)}>
                <IconButton color="primary">
                    <VisibilityIcon />
                </IconButton>
            </Link>
        </TableCell>
    </TableRow>
);

export default UserRow;
