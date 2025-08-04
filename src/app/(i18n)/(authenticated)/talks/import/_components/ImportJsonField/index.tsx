'use client';

import type { FC } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExtractSuccessData } from '@backend/types';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import type { ImportJsonResponse } from '@/app/_api/talks/import';
import { importJson, verifyJsonImport } from '@/app/_api/talks/import';
import ImportJsonRow from '@/app/(i18n)/(authenticated)/talks/import/_components/ImportJsonRow';

import { stripInvalidCharsForDataAttribute } from '@/utils/string';

import { monoFont } from '@/theme';

import FileOpenIcon from '@mui/icons-material/FileOpen';
import UploadIcon from '@mui/icons-material/Upload';
import WarningIcon from '@mui/icons-material/Warning';
import { alpha, styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
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

const ImportJsonField: FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();

    const [json, setJson] = useState<string>('');

    const debouncedJson = useDebounce(json, 500);

    const [error, setError] = useState<string | null>(null);
    const [hasCheckedJson, setHasCheckedJson] = useState<boolean>(false);

    const [importResult, setImportResult] =
        useState<ExtractSuccessData<ImportJsonResponse> | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);

    const [availableRootFolders, setAvailableRootFolders] = useState<string[]>(
        [],
    );
    const [rootFolder, setRootFolder] = useState<string>('');

    const resetImport = useCallback((): void => {
        setJson('');
        setError(null);
        setHasCheckedJson(false);
        setImportResult(null);
        setProcessing(false);
        setAvailableRootFolders([]);
        setRootFolder('');
    }, []);

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
                setError(t('pages.importJsonPage.checkJsonError'));
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
                    <Box mb={2}>
                        <Typography variant="h2" mb={1}>
                            {t('pages.importJsonPage.title')}
                        </Typography>
                        <Typography>
                            {t('pages.importJsonPage.description')}
                        </Typography>
                    </Box>
                    <Box
                        mb={2}
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
                            {t('pages.importJsonPage.fahrplanWarningText')}{' '}
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
                    <Box mb={2}>
                        <StyledTextareaAutosize
                            value={json}
                            onChange={e => setJson(e.target.value)}
                            minRows={10}
                            maxRows={20}
                            placeholder={t(
                                'pages.importJsonPage.pasteJsonHere',
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
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="flex-end"
                        gap={2}
                    >
                        <Button
                            component="label"
                            role={undefined}
                            variant="text"
                            tabIndex={-1}
                            startIcon={<FileOpenIcon />}
                            disabled={processing}
                        >
                            {t('pages.importJsonPage.loadJsonFromFile')}
                            <input
                                type="file"
                                accept=".json"
                                hidden
                                onChange={loadJsonFile}
                            />
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={
                                !json ||
                                error !== null ||
                                !hasCheckedJson ||
                                !rootFolder ||
                                availableRootFolders.length === 0
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

export default ImportJsonField;
