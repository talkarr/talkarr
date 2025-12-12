'use client';

import type { FC } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { alpha, styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import UploadIcon from '@mui/icons-material/Upload';
import WarningIcon from '@mui/icons-material/Warning';

import type { ExtractSuccessData } from '@backend/types';

import type { ImportJsonResponse } from '@/app/_api/talks/import';
import { importJson, verifyJsonImport } from '@/app/_api/talks/import';
import ImportJsonRow from '@/app/(i18n)/(authenticated)/talks/import/_components/ImportJsonRow';

import { monoFont } from '@/theme';

import { useDebounce } from '@uidotdev/usehooks';

const StyledTextareaAutosize = styled(TextareaAutosize)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.background.paper,

    // font
    ...theme.typography.body1,
    fontFamily: monoFont,
}));

export interface EventFahrplanImportJsonFieldProps {
    rootFolder: string;
    goBack: () => void;
}

const EventFahrplanImportJsonField: FC<EventFahrplanImportJsonFieldProps> = ({
    rootFolder,
    goBack,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const [json, setJson] = useState<string>('');

    const debouncedJson = useDebounce(json, 500);

    const [error, setError] = useState<string | null>(null);
    const [hasCheckedJson, setHasCheckedJson] = useState<boolean>(false);

    const [importResult, setImportResult] =
        useState<ExtractSuccessData<ImportJsonResponse> | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);

    const resetImport = useCallback((): void => {
        setJson('');
        setError(null);
        setHasCheckedJson(false);
        setImportResult(null);
        setProcessing(false);
    }, []);

    const loadJsonFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            const content = e.target?.result;
            if (typeof content === 'string') {
                setJson(content);
            }
        };
        // eslint-disable-next-line unicorn/prefer-blob-reading-methods
        reader.readAsText(file);
    };

    useEffect(() => {
        const checkJson = async (): Promise<void> => {
            const result = await verifyJsonImport({
                json: debouncedJson,
            });

            if (!result) {
                setError(
                    t('pages.importJsonPage.eventFahrplan.checkJsonError'),
                );
            } else if (result.success === false) {
                setError(result.error);
            } else {
                setError(null);
                setHasCheckedJson(true);
            }
        };

        if (debouncedJson) {
            checkJson();
        }
    }, [t, debouncedJson]);

    useEffect(() => {
        if (json) {
            setHasCheckedJson(false);
        }
    }, [json]);

    const handleImport = useCallback(async (): Promise<void> => {
        if (!json || error !== null || !hasCheckedJson) {
            return;
        }

        setImportResult(null);
        setProcessing(true);

        const result = await importJson({
            json,
            root_folder: rootFolder,
        });

        if (result.success) {
            setImportResult(result.data);
        } else {
            setError(result.error);
        }

        setProcessing(false);
    }, [json, error, hasCheckedJson, rootFolder]);

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
                            {t('pages.importJsonPage.eventFahrplan.title')}
                        </Typography>
                    </Box>
                    <Box
                        mb={3}
                        sx={{
                            backgroundColor: alpha(
                                theme.palette.warning.main,
                                0.33,
                            ),
                            borderRadius: 4,
                            padding: theme.spacing(1, 2),
                        }}
                        maxWidth="600px"
                        display="flex"
                        flexDirection="row"
                        gap={2}
                        alignItems="center"
                    >
                        <WarningIcon sx={{ marginX: 1 }} />
                        <Typography>
                            {t(
                                'pages.importJsonPage.eventFahrplan.fahrplanWarningText',
                            )}{' '}
                            <a
                                href="https://github.com/EventFahrplan/EventFahrplan/issues/714"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <strong>
                                    <i>EventFahrplan Issue #714</i>
                                </strong>
                            </a>
                        </Typography>
                    </Box>
                    <Box mb={3}>
                        <StyledTextareaAutosize
                            value={json}
                            onChange={e => setJson(e.target.value)}
                            minRows={10}
                            maxRows={20}
                            placeholder={t(
                                'pages.importJsonPage.eventFahrplan.pasteJsonHere',
                            )}
                            spellCheck="false"
                            autoCorrect="off"
                        />
                        {error === null ? null : (
                            <FormHelperText error data-testid="json-error">
                                {error}
                            </FormHelperText>
                        )}
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="flex"
                        gap={2}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={
                                !json ||
                                error !== null ||
                                !hasCheckedJson ||
                                !rootFolder
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
                        <Button
                            component="label"
                            role={undefined}
                            variant="text"
                            tabIndex={-1}
                            startIcon={<FileOpenIcon />}
                            disabled={processing}
                        >
                            {t(
                                'pages.importJsonPage.eventFahrplan.loadJsonFromFile',
                            )}
                            <input
                                type="file"
                                accept=".json"
                                hidden
                                onChange={loadJsonFile}
                            />
                        </Button>
                    </Box>
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

export default EventFahrplanImportJsonField;
