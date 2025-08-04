// === Colors ===
export const pagePrimaryColor = '#9b69ff';
export const pageSecondaryColor = '#5710e6';
export const pageBackgroundColor = '#181a1b';
export const pagePaperColor = '#343536';
export const pageBorderColor = '#ffffff';

// navbar
export const drawerWidth = 240;

export const appbarHeight = 64;

// === Welcome ===
export const welcomePageLink = '/welcome';
export const welcomeStartPageLink = '/welcome/start';

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

// === Settings ===
export const settingsPageLink = '/settings';
export const generalSettingsPageLink = '/settings/general';
export const mediaManagementSettingsPageLink = '/settings/mediamanagement';
export const securitySettingsPageLink = '/settings/security';
export const tasksSettingsPageLink = '/settings/tasks';
export const licensesSettingsPageLink = '/settings/licenses';

// === User ===
export const loginPageLink = '/login';

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

// external links
export const weblateUrl = 'https://weblate.commanderred.xyz/engage/talkarr/';
