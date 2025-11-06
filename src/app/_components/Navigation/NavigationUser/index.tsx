'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import LogoutIcon from '@mui/icons-material/Logout';

import { useSnackbar } from 'notistack';

import useLogout from '@/hooks/use-logout';

import { generateCacheUrl } from '@/utils/cache';

import { userAvatarCacheKey } from '@/cache-keys';
import { loginPageLink } from '@/constants';
import { useUserStore } from '@/providers/user-store-provider';

import UserAvatar from '@components/UserAvatar';

const NavigationUser: FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const user = useUserStore(store => store.user);
    const doLogout = useLogout();
    const { enqueueSnackbar } = useSnackbar();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    const performLogout = (): void => {
        doLogout()
            .then(() => {
                handleClose();
                router.push(loginPageLink);
            })
            .catch(error => {
                enqueueSnackbar(
                    t(
                        'components.navigation.navigationUser.logoutFailedError',
                        {
                            error: error.message || t('common.unknown'),
                        },
                    ),
                    {
                        variant: 'error',
                    },
                );
            });
    };

    return (
        <>
            <UserAvatar user={user} onClick={handleClick} />
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 300,
                            pb: { xs: 2, lg: 3 },
                            borderRadius: 4,
                        },
                        elevation: 3,
                    },
                }}
                sx={{
                    // make sure all MenuItem components inside have at least 48px height
                    '& .MuiMenuItem-root': {
                        minHeight: 48,
                    },
                }}
            >
                <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={2}
                    paddingX={3}
                    paddingTop={{ xs: 2, lg: 3 }}
                >
                    <Avatar
                        src={
                            user
                                ? generateCacheUrl({
                                      url: user.avatarUrl,
                                      cacheKey: userAvatarCacheKey(user),
                                  })
                                : undefined
                        }
                        alt={user?.displayName || user?.email}
                    />
                    <Box display="flex" flexDirection="column">
                        <Typography variant="h6">
                            {user?.displayName || user?.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {user?.email}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <MenuItem>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t(
                            'components.navigation.navigationUser.logout',
                        )}
                        onClick={performLogout}
                    />
                </MenuItem>
            </Popover>
        </>
    );
};

export default NavigationUser;
