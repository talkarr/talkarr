'use client';

import type { FC } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import type { ExtractSuccessData } from '@backend/types';

import { getConfig } from '@/app/_api/settings/mediamanagement';
import type { ImportJsonResponse } from '@/app/_api/talks/import';
import { importJson, verifyJsonImport } from '@/app/_api/talks/import';

import { stripInvalidCharsForDataAttribute } from '@/utils/string';

import { monoFont } from '@/theme';

import ErrorIcon from '@mui/icons-material/Error';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import MovieIcon from '@mui/icons-material/Movie';
import UploadIcon from '@mui/icons-material/Upload';
import { alpha, styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
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

    const loadFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
        reader.readAsText(file);
    };

    useEffect(() => {
        const checkJson = async (): Promise<void> => {
            const result = await verifyJsonImport({
                json: debouncedJson,
            });

            if (!result) {
                setError('An error occurred while verifying the JSON');
            } else if (!result.success) {
                setError(result.error);
            } else {
                setError(null);
                setHasCheckedJson(true);
            }
        };

        if (debouncedJson) {
            checkJson();
        }
    }, [debouncedJson]);

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
            <Box mb={2}>
                <Typography variant="h2" mb={1}>
                    Import JSON
                </Typography>
                <Typography>Import talks from c3 Fahrplan.</Typography>
            </Box>
            <Box mb={1}>
                <StyledTextareaAutosize
                    value={json}
                    onChange={e => setJson(e.target.value)}
                    minRows={10}
                    maxRows={20}
                    placeholder="Paste JSON here"
                    spellCheck="false"
                    autoCorrect="off"
                />
                {error !== null ? (
                    <FormHelperText error data-testid="json-error">
                        {error}
                    </FormHelperText>
                ) : null}
            </Box>
            <Box mb={1}>
                <FormControl fullWidth>
                    <InputLabel id="root-folder-label">Root folder</InputLabel>
                    <Select
                        variant="outlined"
                        fullWidth
                        value={rootFolder}
                        onChange={e => setRootFolder(e.target.value as string)}
                        labelId="root-folder-label"
                        label="Root folder"
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
                    Load JSON
                    <input
                        type="file"
                        accept=".json"
                        hidden
                        onChange={loadFile}
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
                    Import
                </Button>
            </Box>
            {importResult ? (
                <>
                    <Divider sx={{ marginY: 2 }} />
                    <Box>
                        <Typography variant="h3" mb={2}>
                            Import Result
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {importResult.successful_imports.length > 0 ? (
                                <Box
                                    border={1}
                                    borderRadius={4}
                                    p={1}
                                    borderColor={theme.palette.success.main}
                                    bgcolor={alpha(
                                        theme.palette.success.main,
                                        0.2,
                                    )}
                                >
                                    <Typography
                                        variant="h5"
                                        mb={1}
                                        color="success"
                                        marginX={1}
                                    >
                                        Successfully imported{' '}
                                        {importResult.successful_imports.length}{' '}
                                        talks
                                    </Typography>
                                    <List disablePadding sx={{ marginX: 2 }}>
                                        {importResult.successful_imports.map(
                                            talk => (
                                                <ListItem
                                                    key={`successful-import-${talk.slug}`}
                                                    disablePadding
                                                >
                                                    <ListItemIcon>
                                                        <MovieIcon />
                                                    </ListItemIcon>
                                                    <ListItemText>
                                                        {talk.title}
                                                    </ListItemText>
                                                </ListItem>
                                            ),
                                        )}
                                    </List>
                                </Box>
                            ) : null}
                            <Box
                                border={1}
                                borderRadius={4}
                                p={1}
                                bgcolor={alpha(theme.palette.warning.main, 0.2)}
                            >
                                <Typography
                                    variant="h5"
                                    mb={1}
                                    color="warning"
                                    marginX={1}
                                >
                                    {importResult.existing_imports.length} talks
                                    already exist
                                </Typography>
                                <List disablePadding sx={{ marginX: 2 }}>
                                    {importResult.existing_imports.map(talk => (
                                        <ListItem
                                            key={`existing-import-${talk}`}
                                            disablePadding
                                        >
                                            <ListItemIcon>
                                                <MovieIcon color="warning" />
                                            </ListItemIcon>
                                            <ListItemText>{talk}</ListItemText>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                            {importResult.errors ? (
                                <Box
                                    border={1}
                                    borderRadius={4}
                                    p={1}
                                    bgcolor={alpha(
                                        theme.palette.error.main,
                                        0.2,
                                    )}
                                >
                                    <Typography
                                        variant="h5"
                                        mb={1}
                                        color="error"
                                        marginX={1}
                                    >
                                        {importResult.errors.length} errors
                                        occurred
                                    </Typography>
                                    <List disablePadding sx={{ marginX: 2 }}>
                                        {importResult.errors.map(talk => (
                                            <ListItem
                                                key={`failed-import-errors-${talk.slug}`}
                                                disablePadding
                                            >
                                                <ListItemIcon>
                                                    <ErrorIcon color="error" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={talk.slug}
                                                    secondary={talk.error}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            ) : null}
                        </Box>
                    </Box>
                </>
            ) : null}
        </Box>
    );
};

export default ImportJsonField;
