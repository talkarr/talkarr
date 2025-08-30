import type SvgIcon from '@mui/material/SvgIcon';

import TalksIcon from '@mui/icons-material/RecordVoiceOverRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';

import {
    addTalksPageLink,
    generalSettingsPageLink,
    homePageLink,
    importTalksPageLink,
    licensesSettingsPageLink,
    mediaManagementSettingsPageLink,
    scanFilesPageLink,
    securitySettingsPageLink,
    settingsPageLink,
    tasksSettingsPageLink,
} from '@/constants';

export type SimpleNavigationItem = Pick<
    NavigationItemType,
    'title' | 'path' | 'visible' | 'slug'
>;

export interface NavigationItemType {
    title: `navigation.${string}` | '__unset__';
    Icon: typeof SvgIcon;
    subitems?: SimpleNavigationItem[];
    path: string | { href: string; as: string };
    visible?: false;
    slug: string;
}

export type SplitNavigationItems = SimpleNavigationItem[][];

export const settings: (SimpleNavigationItem & {
    title: `navigation.settings.${string}.title`;
    description: `navigation.settings.${string}.description`;
})[] = [
    {
        title: 'navigation.settings.general.title',
        path: generalSettingsPageLink,
        description: 'navigation.settings.general.description',
        slug: 'general',
    },
    {
        title: 'navigation.settings.security.title',
        path: securitySettingsPageLink,
        description: 'navigation.settings.security.description',
        slug: 'security',
    },
    {
        title: 'navigation.settings.mediaManagement.title',
        path: mediaManagementSettingsPageLink,
        description: 'navigation.settings.mediaManagement.description',
        slug: 'media-management',
    },
    {
        title: 'navigation.settings.tasks.title',
        path: tasksSettingsPageLink,
        description: 'navigation.settings.tasks.description',
        slug: 'tasks',
    },
    {
        title: 'navigation.settings.licenses.title',
        path: licensesSettingsPageLink,
        description: 'navigation.settings.licenses.description',
        slug: 'licenses',
    },
];

export const navigationItems: NavigationItemType[] = [
    {
        title: 'navigation.talks',
        Icon: TalksIcon,
        path: homePageLink,
        slug: 'talks',
        subitems: [
            {
                title: 'navigation.addTalk',
                path: addTalksPageLink,
                slug: 'add-talk',
            },
            {
                title: 'navigation.scanFiles',
                path: scanFilesPageLink,
                slug: 'scan-files',
            },
            {
                title: 'navigation.importTalks',
                path: importTalksPageLink,
                slug: 'import-fahrplan',
            },
            {
                title: '__unset__',
                path: '/talks/[slug]',
                visible: false,
                slug: 'specific-talk',
            },
        ],
    },
    {
        title: 'navigation.settings.title',
        Icon: SettingsIcon,
        path: settingsPageLink,
        subitems: settings,
        slug: 'settings',
    },
];
