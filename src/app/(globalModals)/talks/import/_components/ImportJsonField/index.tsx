'use client';

import type { FC } from 'react';
import React, { useMemo, useState } from 'react';

import typia from 'typia';

import type { EventFahrplanJsonImport } from '@/types';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
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
}));

enum JsonValidation {
    VALID,
    NOT_JSON,
    INVALID_JSON,
}

const ImportJsonField: FC = () => {
    const [json, setJson] = useState<string>('');

    const debouncedJson = useDebounce(json, 500);

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

    const isValidJson = useMemo((): JsonValidation => {
        try {
            console.log('isValidJson');
            const parsed = JSON.parse(debouncedJson);

            const eventFahrplanJsonImportCheck =
                typia.createIs<EventFahrplanJsonImport>();

            const isValid = eventFahrplanJsonImportCheck(parsed);

            console.log('isValid', isValid);

            return isValid ? JsonValidation.VALID : JsonValidation.INVALID_JSON;
        } catch (e) {
            console.error(e);
            return JsonValidation.NOT_JSON;
        }
    }, [debouncedJson]);

    return (
        <Box>
            <Box>
                <Typography variant="h2">Import JSON</Typography>
                <StyledTextareaAutosize
                    value={json}
                    onChange={e => setJson(e.target.value)}
                    minRows={10}
                    maxRows={20}
                    placeholder="Paste JSON here"
                />
                {isValidJson === JsonValidation.NOT_JSON ? (
                    <FormHelperText error data-testid="json-error">
                        This is not a valid JSON
                    </FormHelperText>
                ) : null}
                {isValidJson === JsonValidation.INVALID_JSON ? (
                    <FormHelperText error data-testid="json-error">
                        This is not a valid Fahrplan JSON
                    </FormHelperText>
                ) : null}
                <Box>
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<UploadFileIcon />}
                    >
                        Upload JSON
                        <input
                            type="file"
                            accept=".json"
                            hidden
                            onChange={loadFile}
                        />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ImportJsonField;
