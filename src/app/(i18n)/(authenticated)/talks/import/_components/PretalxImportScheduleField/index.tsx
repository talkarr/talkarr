'use client';

import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import UploadIcon from '@mui/icons-material/Upload';

import ScheduleParser from '@backend/helper/schedule-parser';
import type { ExtractSuccessData } from '@backend/types';
import type { C3VocSchedule } from '@backend/types/schedule';

import type {
    ImportScheduleBody,
    ImportScheduleResponse,
} from '@/app/_api/talks/import';
import { importSchedule } from '@/app/_api/talks/import';
import ImportJsonRow from '@/app/(i18n)/(authenticated)/talks/import/_components/ImportJsonRow';
import PretalxImportScheduleFieldItem from '@/app/(i18n)/(authenticated)/talks/import/_components/PretalxImportScheduleFieldItem';

import { useUiStore } from '@/providers/ui-store-provider';

export interface ImportScheduleFieldProps {
    rootFolder: string;
    goBack: () => void;
}

const ImportScheduleField: FC<ImportScheduleFieldProps> = ({
    rootFolder,
    goBack,
}) => {
    const { t } = useTranslation();

    const selectedGuids = useUiStore(
        store => store.importScheduleSelectedGuids,
    );
    const clearSelectedGuids = useUiStore(
        store => store.clearImportScheduleSelectedGuids,
    );

    const [scheduleUrl, setScheduleUrl] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const [importResult, setImportResult] =
        useState<ExtractSuccessData<ImportScheduleResponse> | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);

    const [scheduleJson, setScheduleJson] = useState<C3VocSchedule | null>(
        null,
    );

    const scheduleParser = useMemo(() => new ScheduleParser(), []);

    const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);

    const resetImport = useCallback((): void => {
        clearSelectedGuids();
        setScheduleUrl('');
        setError(null);
        setImportResult(null);
        setProcessing(false);
    }, [clearSelectedGuids]);

    const scheduleOverview = useMemo(() => {
        scheduleParser.parse(scheduleJson);

        if (scheduleJson) {
            return scheduleParser.getOverview();
        }
        return null;
    }, [scheduleJson, scheduleParser]);

    const handleImport = useCallback(async (): Promise<void> => {
        if (error !== null || !scheduleOverview) {
            return;
        }

        setImportResult(null);
        setProcessing(true);

        const result = await importSchedule({
            selected_events: selectedGuids
                .map(guid => {
                    const event = scheduleOverview.events.find(
                        value => value.guid === guid,
                    );

                    if (!event) {
                        return false;
                    }

                    return {
                        title: event.title,
                        guid: event.guid,
                        slug: event.slug,
                        description: event.description,
                        abstract: event.abstract,
                        language: event.language,
                        persons: event.persons.map(
                            person => person.public_name || person.name,
                        ),
                    } as ImportScheduleBody['selected_events'][number];
                })
                .filter(Boolean) as ImportScheduleBody['selected_events'],
            root_folder: rootFolder,
        });

        if (result.success) {
            setImportError(null);
            setImportResult(result.data);
        } else {
            setImportError(result.error);
        }

        setProcessing(false);
        clearSelectedGuids();
    }, [
        error,
        scheduleOverview,
        selectedGuids,
        rootFolder,
        clearSelectedGuids,
    ]);

    const handleFetchSchedule = useCallback(async (): Promise<void> => {
        if (error !== null || !rootFolder || selectedGuids.length > 1) {
            return;
        }

        if (!scheduleUrl) {
            console.warn('Invalid url, scheduleUrl resolved to false');
            setError(t('pages.importJsonPage.schedule.invalidUrl'));
            return;
        }

        let parsedUrl: URL;

        try {
            parsedUrl = new URL(scheduleUrl);
            // eslint-disable-next-line unicorn/catch-error-name
        } catch (err) {
            console.warn(`Invalid url during url parsing, ${err}`);
            setError(t('pages.importJsonPage.schedule.invalidUrl'));
            return;
        }

        setError(null);

        try {
            setScheduleJson(null);
            setScheduleLoading(true);
            clearSelectedGuids();

            const result = await fetch(parsedUrl, {
                credentials: 'omit',
            });

            const returnedJson = await result.json();

            if (
                !('$schema' in returnedJson) ||
                returnedJson.$schema !==
                    'https://c3voc.de/schedule/schema.json' ||
                !('schedule' in returnedJson)
            ) {
                setError(t('pages.importJsonPage.schedule.invalidSchema'));
                return;
            }

            const verifiedJson = returnedJson as C3VocSchedule;

            setScheduleJson(verifiedJson);
            // eslint-disable-next-line unicorn/catch-error-name
        } catch (err) {
            console.warn(`Invalid url during fetching, ${err}`);
            setScheduleLoading(false);

            setError(t('pages.importJsonPage.schedule.invalidUrl'));
            return;
        }
    }, [
        error,
        rootFolder,
        selectedGuids.length,
        scheduleUrl,
        t,
        clearSelectedGuids,
    ]);

    useEffect(() => {
        if (scheduleOverview) {
            setScheduleLoading(false);
        }
    }, [scheduleOverview]);

    return (
        <Box>
            {importResult === null ? (
                <>
                    <Box
                        mb={2}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        gap={3}
                    >
                        <IconButton
                            onClick={() => {
                                resetImport();
                                goBack();
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h2">
                            {t('pages.importJsonPage.schedule.title')}
                        </Typography>
                    </Box>
                    <Typography mb={2}>
                        <Trans i18nKey="pages.importJsonPage.schedule.hint">
                            All schedule.json files that follow{' '}
                            <a href="https://c3voc.de/wiki/schedule">
                                this schema
                            </a>{' '}
                            should be compatible. Most common sources are for
                            example Pretalx. For Pretalx, just visit the
                            schedule website and click on the version on the top
                            right. Then copy the link to the JSON export and
                            paste it here.
                        </Trans>
                    </Typography>
                    <Box mb={2}>
                        <form
                            onSubmit={event => {
                                event.preventDefault();
                                handleFetchSchedule();
                            }}
                        >
                            <TextField
                                value={scheduleUrl}
                                onChange={e => {
                                    setScheduleUrl(e.target.value);
                                    setError(null);
                                }}
                                placeholder={t(
                                    'pages.importJsonPage.schedule.url',
                                )}
                                spellCheck="false"
                                autoCorrect="off"
                                fullWidth
                                disabled={
                                    // eslint-disable-next-line react/jsx-no-leaked-render
                                    scheduleOverview !== null &&
                                    selectedGuids.length > 0
                                }
                            />
                            {error === null ? null : (
                                <FormHelperText
                                    error
                                    data-testid="schedule-error"
                                >
                                    {error}
                                </FormHelperText>
                            )}
                            <input type="submit" hidden />
                        </form>
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="flex-start"
                        gap={2}
                        mb={3}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={
                                error !== null ||
                                !rootFolder ||
                                selectedGuids.length > 1
                            }
                            loading={scheduleLoading}
                            sx={{
                                minWidth: 120,
                            }}
                            startIcon={<DownloadForOfflineIcon />}
                            onClick={handleFetchSchedule}
                        >
                            {t('pages.importJsonPage.schedule.loadButton')}
                        </Button>
                    </Box>
                    {scheduleOverview === null ? null : (
                        <Box>
                            {scheduleOverview.conference.days.map(
                                conferenceDay => (
                                    <Box key={conferenceDay.date} mb={3}>
                                        <Typography variant="h3" mb={2}>
                                            {t(
                                                'pages.importJsonPage.schedule.dayN',
                                                {
                                                    index: conferenceDay.index,
                                                },
                                            )}
                                        </Typography>
                                        <Grid container gap={1}>
                                            {Object.values(conferenceDay.rooms)
                                                .flat()
                                                .map(scheduleEvent => (
                                                    <PretalxImportScheduleFieldItem
                                                        key={scheduleEvent.guid}
                                                        scheduleEvent={
                                                            scheduleEvent
                                                        }
                                                        disabled={processing}
                                                    />
                                                ))}
                                        </Grid>
                                    </Box>
                                ),
                            )}
                            <Box
                                display="flex"
                                flexDirection="row"
                                justifyContent="flex-start"
                                gap={2}
                                mt={3}
                                position="sticky"
                                bottom={0}
                                py={2}
                                bgcolor="background.default"
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={
                                        error !== null ||
                                        !rootFolder ||
                                        selectedGuids.length === 0
                                    }
                                    loading={processing}
                                    sx={{
                                        minWidth: 120,
                                    }}
                                    startIcon={<UploadIcon />}
                                    onClick={handleImport}
                                >
                                    {t('pages.importJsonPage.importButton')}
                                </Button>
                                {importError ? (
                                    <Typography color="error">
                                        {importError}
                                    </Typography>
                                ) : null}
                            </Box>
                        </Box>
                    )}
                </>
            ) : (
                <Box>
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h3">
                            {t('pages.importJsonPage.importResult')}
                        </Typography>
                        <Button
                            variant="text"
                            color="error"
                            onClick={resetImport}
                            data-testid="reset-import"
                        >
                            {t('pages.importJsonPage.resetImport')}
                        </Button>
                    </Box>
                    <List>
                        {importResult.errors?.map(data => (
                            <ImportJsonRow errorData={data} key={data.slug} />
                        ))}
                        {importResult.successful_imports?.map(data => (
                            <ImportJsonRow successData={data} key={data.slug} />
                        ))}
                        {importResult.existing_imports?.map(data => (
                            <ImportJsonRow existingData={data} key={data} />
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    );
};

export default ImportScheduleField;
