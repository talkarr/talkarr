import type { ApiUser } from '@/stores/userStore';

// === Cache keys ===
export const userAvatarCacheKey = (user: ApiUser): string =>
    `user-avatar-${user.id}`;
