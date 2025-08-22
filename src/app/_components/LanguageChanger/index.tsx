'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { weblateUrl } from '@/constants';
import { languages } from '@/i18n';
import weblateIcon from '@/svg/weblate-icon.svg';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

export interface LanguageChangerProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

const LanguageChanger: FC<LanguageChangerProps> = ({ anchorEl, onClose }) => {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const setLanguage = async (lang: string): Promise<void> => {
        await i18n.changeLanguage(lang);
        onClose();
        router.refresh();
    };

    const mappedLanguages = languages.map(lang => {
        // use the intl api to get the language name
        const languageName =
            new Intl.DisplayNames([lang], { type: 'language' }).of(lang) ||
            lang;

        return {
            language: lang,
            languageName,
        };
    });

    const openWeblate = (): void => {
        window.open(weblateUrl, '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        <Popover
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            slotProps={{
                paper: {
                    sx: {
                        minWidth: 150,
                        maxWidth: 400,
                        borderRadius: 2,
                    },
                    elevation: 3,
                    // @ts-expect-error: Paper does not have data-testid, and because it is slotProps, it does not allow for extra props
                    'data-testid': 'language-changer-popover',
                },
            }}
            sx={{
                // make sure all MenuItem components inside have at least 48px height
                '& .MuiMenuItem-root': {
                    minHeight: 48,
                },
            }}
        >
            {mappedLanguages.map(({ language, languageName }) => (
                <MenuItem
                    key={`language-${language}`}
                    onClick={() => setLanguage(language)}
                    data-testid={`language-${language}`}
                >
                    <ListItemText primary={languageName} />
                </MenuItem>
            ))}
            <Divider
                sx={{
                    borderColor: theme => theme.palette.action.disabled,
                    marginY: '0 !important',
                }}
            />
            <MenuItem onClick={openWeblate}>
                <Box
                    display="flex"
                    flexDirection="row"
                    gap={1}
                    alignItems="center"
                    paddingY={1}
                    paddingX={2}
                >
                    <Image
                        src={weblateIcon}
                        alt="Weblate icon"
                        height={36}
                        priority
                    />
                    <Typography align="center" sx={{ textWrap: 'auto' }}>
                        {t('components.languageChanger.weblateInfo')}
                    </Typography>
                </Box>
            </MenuItem>
        </Popover>
    );
};

export default LanguageChanger;
