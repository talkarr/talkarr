import { cookies } from 'next/headers';

import i18next, { cookieName } from '@/i18n';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function getServerSideTranslation(
    ns?: string | readonly string[],
    options: { keyPrefix?: string } = {},
) {
    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || null;
    if (lng && i18next.resolvedLanguage !== lng) {
        await i18next.changeLanguage(lng);
    }
    if (ns && !i18next.hasLoadedNamespace(ns)) {
        await i18next.loadNamespaces(ns);
    }
    return {
        t: i18next.getFixedT(
            (lng ?? i18next.resolvedLanguage) as string,
            Array.isArray(ns) ? (ns[0] as string) : ns,
            options.keyPrefix,
        ),
        i18n: i18next,
    };
}
