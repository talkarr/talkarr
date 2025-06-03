// === Colors ===
export const pagePrimaryColor = '#9b69ff';
export const pageSecondaryColor = '#390a96';
export const pageBackgroundColor = '#181a1b';
export const pagePaperColor = '#343536';
export const pageBorderColor = '#ffffff';
export const pageName = 'Talkarr';

// === Paths ===
export const homePageLink = '/';
export const addTalksPageLink = '/talks/add';
export const addTalksPageWithSearchLink = (search: string): string => {
    const searchParams = new URLSearchParams();
    searchParams.set('search', search);

    return `/talks/add?${searchParams.toString()}`;
};
export const scanFilesPageLink = '/talks/scan';
export const importTalksPageLink = '/talks/import';
export const specificTalkPageLink = (slug: string): string => `/talks/${slug}`;
export const settingsPageLink = '/settings';
export const mediaManagementSettingsPageLink = '/settings/mediamanagement';
export const authManagementSettingsPageLink = '/settings/authmanagement';

// === API ===
export const apiBaseUrl = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3232}`;

// === Misc ===
export const searchExamples = [
    `Breaking "DRM" in Polish trains`,
    `Breaking NATO Radio Encryption`,
    `Fnord-Nachrichtenrückblick 2024`,
    `Wie synthetisiert man DNA`,
] as const;

export const getSearchExample = (): string =>
    searchExamples[Math.floor(Math.random() * searchExamples.length)];

// european style
export const longDateTimeFormat = 'DD.MM.yyyy HH:mm';

export const longDateFormat = 'DD.MM.yyyy';

export const yearOnlyFormat = 'yyyy';
