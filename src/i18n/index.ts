/* eslint-disable unicorn/prefer-export-from */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import backend from 'i18next-resources-to-backend';

export const languages = ['en', 'de'];
export const fallbackLng = 'en';
export const cookieName = 'i18nextLng';

const runsOnServer = typeof window === 'undefined';

i18n.use(LanguageDetector)
    .use(
        backend(
            (language: string) => import(`@/translations/${language}.json`),
        ),
    )
    .init({
        supportedLngs: languages,
        lng: undefined,
        fallbackLng,
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['cookie', 'navigator', 'htmlTag'],
            caches: ['cookie'],
            lookupCookie: cookieName,
        },
        preload: runsOnServer ? languages : undefined,
    });

export default i18n;
