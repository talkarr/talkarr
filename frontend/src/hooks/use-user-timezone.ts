'use client';

import { defaultTimezone } from '@/constants';
import { useUserStore } from '@/providers/user-store-provider';

const useUserTimezone = (): string =>
    useUserStore(store => store.user?.preferences.timezone || defaultTimezone);

export default useUserTimezone;
