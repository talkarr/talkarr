import type { ApiUser } from '@/stores/user-store';

// === Cache keys ===
export const userAvatarCacheKey = (user: ApiUser): string =>
    `user-avatar-${user.id}`;
