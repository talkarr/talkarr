import type { FC } from 'react';

import type { components } from '@backend/generated/schema';

import { generateCacheUrl } from '@/utils/cache';

import { userAvatarCacheKey } from '@/cacheKeys';

import CustomAvatar from '@components/CustomAvatar';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export interface UserRowProps {
    user: components['schemas']['User'];
}

const UserRow: FC<UserRowProps> = ({ user }) => (
    <TableRow>
        <TableCell component="th" scope="row">
            <Box display="flex" flexDirection="row" alignItems="center">
                <CustomAvatar
                    alt={user.displayName || user.email}
                    src={generateCacheUrl({
                        url: user.avatarUrl,
                        cacheKey: userAvatarCacheKey(user),
                    })}
                    sx={{ width: 40, height: 40, marginRight: 2 }}
                />
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
            <IconButton color="primary">
                <EditIcon />
            </IconButton>
        </TableCell>
    </TableRow>
);

export default UserRow;
