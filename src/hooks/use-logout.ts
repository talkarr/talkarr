import { logoutUser } from '@/app/_api/user/logout';

import { useUserStore } from '@/providers/user-store-provider';

const useLogout = (): (() => Promise<void>) => {
    const clearUser = useUserStore(store => store.clearUser);

    return async (): Promise<void> => {
        const result = await logoutUser();

        if (result?.success) {
            clearUser();
        } else {
            throw new Error(result?.error || 'Logout failed');
        }
    };
};

export default useLogout;
