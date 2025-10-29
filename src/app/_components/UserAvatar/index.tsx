import type { FC } from 'react';

import type { components } from '@backend/generated/schema';

import { generateCacheUrl } from '@/utils/cache';

import { userAvatarCacheKey } from '@/cache-keys';

import CustomAvatar from '@components/CustomAvatar';

export interface UserAvatarProps {
    user: components['schemas']['User'] | null;
    circle?: boolean;
}

const UserAvatar: FC<UserAvatarProps> = ({ user, circle }) => (
    <CustomAvatar
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
            marginRight: 2,
            borderRadius: circle ? '50%' : undefined,
        }}
    />
);

export default UserAvatar;
