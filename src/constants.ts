// === Colors ===
export const pagePrimaryColor = '#9b69ff';
export const pageSecondaryColor = '#390a96';
export const pageBackgroundColor = '#181a1b';
export const pagePaperColor = '#242526';
export const pageBorderColor = '#ffffff';
export const pageName = 'Talkarr';

// === Paths ===
export const homePageLink = '/';
export const addTalksPageLink = '/talks/add';
export const importTalksPageLink = '/talks/import';
export const settingsPageLink = '/settings';
export const mediaManagementSettingsPageLink = '/settings/mediamanagement';

// === API ===
export const apiBaseUrl = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3232}`;

// === Misc ===
export const searchExamples = [
    `Breaking "DRM" in Polish trains`,
    `Breaking NATO Radio Encryption`,
    `Fnord-Nachrichtenrückblick 2024`,
] as const;

export const getSearchExample = (): string =>
    searchExamples[Math.floor(Math.random() * searchExamples.length)];

// european style
export const longDateTimeFormat = 'DD.MM.yyyy HH:mm';

export const longDateFormat = 'DD.MM.yyyy';
