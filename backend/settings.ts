import deepmerge from 'deepmerge';
import typia from 'typia';

import { prisma } from '@backend/prisma';
import rootLog from '@backend/root-log';
import type { Settings } from '@backend/types/settings';
import { ImportIsRecordedFlagBehavior } from '@backend/types/settings';

const log = rootLog.child({ label: 'settings' });

const check = typia.createIs<Settings>();

export type SettingsKey = keyof Settings;

export type SettingsValue<K extends SettingsKey> = Settings[K];

export const initialSettings: Settings = {
    general: {
        allowLibravatar: false, // Make this opt-in
        importIsRecordedFlagBehavior:
            ImportIsRecordedFlagBehavior.skipImportIfIsNotRecorded,
    },
    mediamanagement: {},
    security: {},
};

export const setSettingsIfNotSet = async (): Promise<Settings> => {
    try {
        const generalSettings = await prisma.settings.findMany({
            select: {
                key: true,
            },
            where: {
                key: 'general',
            },
        });

        if (generalSettings.length === 0) {
            log.info('Creating initial general settings');
            await prisma.settings.create({
                data: {
                    key: 'general',
                    value: JSON.stringify(initialSettings.general),
                },
            });
        }

        const securitySettings = await prisma.settings.findMany({
            select: {
                key: true,
            },
            where: {
                key: 'security',
            },
        });

        if (securitySettings.length === 0) {
            log.info('Creating initial security settings');
            await prisma.settings.create({
                data: {
                    key: 'security',
                    value: JSON.stringify(initialSettings.security),
                },
            });
        }

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
    } catch (error) {
        log.error('Error setting initial settings:', { error });

        throw error;
    }

    return initialSettings;
};

const settings: Settings = {} as Settings;

let settingsLoaded = false;

const recoverSettings = async (): Promise<void> => {
    const existingSettings = await prisma.settings.findMany({
        select: {
            key: true,
            value: true,
        },
    });

    const existingSettingsMap: Record<string, object> = {};

    for (const setting of existingSettings) {
        existingSettingsMap[setting.key] = JSON.parse(setting.value);
    }

    const mergedSettings: Settings = deepmerge(
        initialSettings,
        existingSettingsMap,
    );

    if (!check(mergedSettings)) {
        log.warn('Recovered settings validation failed', { mergedSettings });
        throw new Error('Recovered settings validation failed');
    }

    // now save the merged settings
    for await (const key of Object.keys(mergedSettings) as (keyof Settings)[]) {
        await prisma.settings.upsert({
            where: { key },
            create: {
                key,
                value: JSON.stringify(mergedSettings[key]),
            },
            update: {
                value: JSON.stringify(mergedSettings[key]),
            },
        });
    }

    log.info('Recovered settings:', { mergedSettings });
};

export const loadSettings = async (recursive?: boolean): Promise<void> => {
    try {
        await setSettingsIfNotSet();

        const settingsQuery = await prisma.settings.findMany({
            select: {
                key: true,
                value: true,
            },
        });

        for (const setting of settingsQuery) {
            settings[setting.key as keyof Settings] = JSON.parse(
                setting.value,
            ) as never;
        }

        // check if all settings are loaded
        if (!check(settings)) {
            log.warn('Settings validation failed', { settings });
            await recoverSettings();
            if (!recursive) {
                await loadSettings(true);
            }
        }

        log.info('Settings loaded:', { settings });

        settingsLoaded = true;
    } catch (error) {
        log.error('Error loading settings:', { error });

        throw error;
    }
};

export const saveSettings = async (): Promise<void> => {
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

        log.info('Settings saved:', { settings });
    } catch (error) {
        log.error('Error saving settings:', { error });

        throw error;
    }
};

export const getSettings = (): Readonly<Settings> => {
    if (!settingsLoaded) {
        throw new Error('Settings not loaded');
    }

    return settings;
};

export const setSettings = async <TSettingsKey extends SettingsKey>(
    key: TSettingsKey,
    value:
        | ((
              current: SettingsValue<TSettingsKey>,
          ) => SettingsValue<TSettingsKey>)
        | SettingsValue<TSettingsKey>,
    save = true,
): Promise<void> => {
    if (!settingsLoaded) {
        throw new Error('Settings not loaded');
    }

    let newSettings = value;

    if (typeof value === 'function') {
        newSettings = value(settings[key]);
    }

    settings[key] = newSettings as SettingsValue<TSettingsKey>;

    if (save) {
        await saveSettings();
    }
};
