import type SvgIcon from '@mui/material/SvgIcon';

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

import TalksIcon from '@mui/icons-material/RecordVoiceOverRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';

export type SimpleNavigationItem = Pick<
    NavigationItemType,
    'title' | 'path' | 'visible' | 'slug'
>;

export interface NavigationItemType {
    title: string;
    Icon: typeof SvgIcon;
    subitems?: SimpleNavigationItem[];
    path: string | { href: string; as: string };
    visible?: false;
    slug: string;
}

export type SplitNavigationItems = SimpleNavigationItem[][];

export const settings: (SimpleNavigationItem & { description: string })[] = [
    {
        title: 'General',
        path: generalSettingsPageLink,
        description:
            'Functionality control, external services, and other general settings.',
        slug: 'general',
    },
    {
        title: 'Security',
        path: securitySettingsPageLink,
        description: 'Manage users, permissions and security settings.',
        slug: 'security',
    },
    {
        title: 'Media Management',
        path: mediaManagementSettingsPageLink,
        description: 'Naming and management of media files.',
        slug: 'media-management',
    },
    {
        title: 'Tasks',
        path: tasksSettingsPageLink,
        description: 'Manage scheduled tasks.',
        slug: 'tasks',
    },
    {
        title: 'Licenses',
        path: licensesSettingsPageLink,
        description: 'View licenses of used packages.',
        slug: 'licenses',
    },
];

export const navigationItems: NavigationItemType[] = [
    {
        title: 'Talks',
        Icon: TalksIcon,
        path: homePageLink,
        slug: 'talks',
        subitems: [
            {
                title: 'Add Talk',
                path: addTalksPageLink,
                slug: 'add-talk',
            },
            {
                title: 'Scan files',
                path: scanFilesPageLink,
                slug: 'scan-files',
            },
            {
                title: 'Import Fahrplan',
                path: importTalksPageLink,
                slug: 'import-fahrplan',
            },
            {
                title: 'Specific Talk',
                path: '/talks/[slug]',
                visible: false,
                slug: 'specific-talk',
            },
        ],
    },
    {
        title: 'Settings',
        Icon: SettingsIcon,
        path: settingsPageLink,
        subitems: settings,
        slug: 'settings',
    },
];
