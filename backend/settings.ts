import type { MediamanagementSettings } from '@backend/api/settings/mediamanagement';
import rootLog from '@backend/rootLog';

import { PrismaClient } from '@prisma/client';

const log = rootLog.child({ label: 'settings' });

export interface Settings {
    mediamanagement: MediamanagementSettings;
}

export const initialSettings: Settings = {
    mediamanagement: {},
};

export const setSettingsIfNotSet = async (): Promise<Settings> => {
    const prisma = new PrismaClient();

    const mediaManagementSettings = await prisma.settings.findMany({
        select: {
            key: true,
        },
        where: {
            key: 'mediamanagement',
        },
    });

    if (mediaManagementSettings.length === 0) {
        log.info('Creating initial media management settings');
        await prisma.settings.create({
            data: {
                key: 'mediamanagement',
                value: JSON.stringify(initialSettings.mediamanagement),
            },
        });
    }

    await prisma.$disconnect();

    return initialSettings;
};

const settings: Settings = {} as Settings;

let settingsLoaded = false;

export const loadSettings = async (): Promise<void> => {
    try {
        await setSettingsIfNotSet();

        const prisma = new PrismaClient();

        const settingsQuery = await prisma.settings.findMany({
            select: {
                key: true,
                value: true,
            },
        });

        await prisma.$disconnect();

        for (const setting of settingsQuery) {
            settings[setting.key as keyof Settings] = JSON.parse(
                setting.value,
            ) as Settings[keyof Settings];
        }

        log.info('Settings loaded:', settings);

        settingsLoaded = true;
    } catch (e) {
        log.error('Error loading settings:', e);

        throw e;
    }
};

export const saveSettings = async (): Promise<void> => {
    const prisma = new PrismaClient();

    try {
        for await (const key of Object.keys(settings) as (keyof Settings)[]) {
            await prisma.settings.update({
                where: {
                    key,
                },
                data: {
                    value: JSON.stringify(settings[key]),
                },
            });
        }

        log.info('Settings saved:', settings);
    } catch (e) {
        log.error('Error saving settings:', e);

        throw e;
    } finally {
        await prisma.$disconnect();
    }
};

export const getSettings = (): Readonly<Settings> => {
    if (!settingsLoaded) {
        throw new Error('Settings not loaded');
    }

    return settings;
};

export const setSettings = async (
    key: keyof Settings,
    value:
        | ((current: Settings[keyof Settings]) => Settings[keyof Settings])
        | Settings[keyof Settings],
    save = true,
): Promise<void> => {
    if (!settingsLoaded) {
        throw new Error('Settings not loaded');
    }

    let newSettings = value;

    if (typeof value === 'function') {
        newSettings = value(settings[key]);
    }

    settings[key] = newSettings as Settings[keyof Settings];

    if (save) {
        await saveSettings();
    }
};
