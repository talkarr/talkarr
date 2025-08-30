'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { alpha } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';

import ErrorIcon from '@mui/icons-material/Error';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import MovieIcon from '@mui/icons-material/Movie';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';

import type { ExtractSuccessData } from '@backend/types';

import type { ImportJsonResponse } from '@/app/_api/talks/import';

type ImportResponseData = ExtractSuccessData<ImportJsonResponse>;

export interface ImportJsonRowSuccessProps {
    successData: NonNullable<ImportResponseData['successful_imports']>[number];
    errorData?: never;
    existingData?: never;
}

export interface ImportJsonRowErrorProps {
    successData?: never;
    errorData: NonNullable<ImportResponseData['errors']>[number];
    existingData?: never;
}

export interface ImportJsonRowExistingProps {
    successData?: never;
    errorData?: never;
    existingData: NonNullable<ImportResponseData['existing_imports']>[number];
}

export type ImportJsonRowProps =
    | ImportJsonRowSuccessProps
    | ImportJsonRowErrorProps
    | ImportJsonRowExistingProps;

const ImportJsonRow: FC<ImportJsonRowProps> = ({
    successData,
    existingData,
    errorData,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <ListItem
            sx={{
                borderRadius: 2,
                marginY: 1,
                backgroundColor: successData
                    ? alpha(theme.palette.success.main, 0.1)
                    : existingData
                      ? alpha(theme.palette.warning.main, 0.1)
                      : errorData
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.grey[500], 0.1),
            }}
        >
            <ListItemIcon>
                {successData ? (
                    <MovieIcon color="success" />
                ) : existingData ? (
                    <FolderCopyRoundedIcon color="warning" />
                ) : errorData ? (
                    errorData.isRecorded === false ? (
                        <VideocamOffRoundedIcon color="error" />
                    ) : (
                        <ErrorIcon color="error" />
                    )
                ) : (
                    <QuestionMarkRoundedIcon color="disabled" />
                )}
            </ListItemIcon>
            <ListItemText
                primary={
                    successData
                        ? successData.title
                        : existingData ||
                          (errorData ? errorData.title : t('common.unknown'))
                }
                secondary={
                    successData
                        ? t(
                              'pages.importJsonPage.components.importJsonRow.successfullyImported',
                              {
                                  slug: successData.slug,
                              },
                          )
                        : existingData
                          ? t(
                                'pages.importJsonPage.components.importJsonRow.alreadyExists',
                                {
                                    slug: existingData,
                                },
                            )
                          : errorData
                            ? t(
                                  'pages.importJsonPage.components.importJsonRow.failedToImport',
                                  {
                                      slug: errorData.slug,
                                      error: errorData.error,
                                  },
                              )
                            : t(
                                  'pages.importJsonPage.components.importJsonRow.unknownImportStatus',
                              )
                }
            />
        </ListItem>
    );
};

export default ImportJsonRow;
