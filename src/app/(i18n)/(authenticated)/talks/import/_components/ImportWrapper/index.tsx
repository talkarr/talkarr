'use client';

import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import EventFahrplanImportJsonField from '@/app/(i18n)/(authenticated)/talks/import/_components/EventFahrplanImportJsonField';
import ImportScheduleField from '@/app/(i18n)/(authenticated)/talks/import/_components/PretalxImportScheduleField';

import { stripInvalidCharsForDataAttribute } from '@/utils/string';

import SelectCard from '@components/SelectCard';

const importMethods = ['eventFahrplan', /* 'halfnarp', */ 'schedule'] as const;

type ImportMethod = (typeof importMethods)[number];

const ImportWrapper: FC = () => {
    const { t } = useTranslation();

    const [availableRootFolders, setAvailableRootFolders] = useState<string[]>(
        [],
    );
    const [rootFolder, setRootFolder] = useState<string>('');

    useEffect(() => {
        const func = async (): Promise<void> => {
            const config = await getConfig();

            const data = config?.success ? config.data : null;

            if (data) {
                setAvailableRootFolders(data.folders.map(f => f.folder));
                if (data.folders.length > 0) {
                    setRootFolder(data.folders[0].folder);
                }
            }
        };

        func();
    }, []);

    const [selectedMethod, setSelectedMethod] =
        useState<ImportMethod>('eventFahrplan');

    const [confirmedMethod, setConfirmedMethod] = useState<ImportMethod | null>(
        null,
    );

    const goBack = (): void => {
        setConfirmedMethod(null);
    };

    const methodComponent = useMemo(() => {
        if (!confirmedMethod) {
            return null;
        }

        switch (confirmedMethod) {
            case 'eventFahrplan': {
                return (
                    <EventFahrplanImportJsonField
                        rootFolder={rootFolder}
                        goBack={goBack}
                    />
                );
            }
            case 'schedule': {
                return (
                    <ImportScheduleField
                        rootFolder={rootFolder}
                        goBack={goBack}
                    />
                );
            }
            default: {
                return null;
            }
        }
    }, [confirmedMethod, rootFolder]);

    return (
        <Box>
            {confirmedMethod ? (
                <>{methodComponent}</>
            ) : (
                <Box>
                    <Box mb={4}>
                        <Typography variant="h2" mb={1}>
                            {t('pages.importJsonPage.title')}
                        </Typography>
                    </Box>
                    <Box mb={2}>
                        <FormControl fullWidth>
                            <InputLabel id="root-folder-label">
                                {t('pages.importJsonPage.selectRootFolder')}
                            </InputLabel>
                            <Select
                                variant="outlined"
                                fullWidth
                                value={rootFolder}
                                onChange={e =>
                                    setRootFolder(e.target.value as string)
                                }
                                labelId="root-folder-label"
                                label={t(
                                    'pages.importJsonPage.selectRootFolder',
                                )}
                                data-testid="root-folder-select"
                                disabled={selectedMethod === null}
                            >
                                {availableRootFolders.map(folder => (
                                    <MenuItem
                                        key={folder}
                                        value={folder}
                                        data-testid={`root-folder-${stripInvalidCharsForDataAttribute(folder)}`}
                                    >
                                        {folder}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Grid container gap={2} mb={2}>
                        {importMethods.map(method => (
                            <Grid key={method}>
                                <SelectCard
                                    title={t(
                                        `pages.importJsonPage.methods.${method}.title`,
                                    )}
                                    selected={selectedMethod === method}
                                    onClick={() => setSelectedMethod(method)}
                                    sx={{
                                        height: '100%',
                                    }}
                                >
                                    <Typography>
                                        {t(
                                            `pages.importJsonPage.methods.${method}.description`,
                                        )}
                                    </Typography>
                                </SelectCard>
                            </Grid>
                        ))}
                    </Grid>
                    <Button
                        variant="contained"
                        sx={{ minWidth: 200 }}
                        onClick={() => {
                            setConfirmedMethod(selectedMethod);
                        }}
                    >
                        {t('common.continue')}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ImportWrapper;
