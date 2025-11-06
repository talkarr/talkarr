'use client';

import type { FC } from 'react';

import { useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';

import type { ButtonBaseProps } from '@mui/material';

import type { components } from '@backend/generated/schema';

import { generateCacheUrl } from '@/utils/cache';

import { userAvatarCacheKey } from '@/cache-keys';

export interface UserAvatarProps {
    user: components['schemas']['User'] | null;
    circle?: boolean;
    onClick?: ButtonBaseProps['onClick'];
}

const UserAvatar: FC<UserAvatarProps> = ({ user, circle, onClick }) => {
    const theme = useTheme();

    const borderRadius = circle ? '50%' : theme.shape.borderRadius * 2;

    const inner = (
        <Avatar
            alt={user?.displayName || user?.email}
            src={
                user
                    ? generateCacheUrl({
                          url: user.avatarUrl,
                          cacheKey: userAvatarCacheKey(user),
                      })
                    : undefined
            }
            sx={{
                width: 40,
                height: 40,
                borderRadius,
            }}
        />
    );

    return onClick ? (
        <ButtonBase onClick={onClick} sx={{ borderRadius }}>
            {inner}
        </ButtonBase>
    ) : (
        inner
    );
};

export default UserAvatar;
