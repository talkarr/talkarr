'use client';

import type { FC, PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n';

export interface UseClientI18nProps extends PropsWithChildren {
    cookieLocale?: string;
}

const UseClientI18n: FC<UseClientI18nProps> = ({ children, cookieLocale }) => {
    if (cookieLocale && i18n.resolvedLanguage !== cookieLocale) {
        i18n.changeLanguage(cookieLocale);
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default UseClientI18n;
