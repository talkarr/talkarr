// === Colors ===
export const pagePrimaryColor = '#a87efd';
export const pageSecondaryColor = '#190b2f';
export const pageBackgroundColor = '#181a1b';
export const pagePaperColor = '#242526';
export const pageBorderColor = '#4d4954';
export const pageName = 'Talkarr';

// === Paths ===
export const addTalksPath = '/talks/add';

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
