'use client';

import { useRouter } from 'next/navigation';

import type { FC } from 'react';

import { enqueueSnackbar } from 'notistack';

import type { SingleTalkData } from '@/app/(globalModals)/talks/[slug]/page';

import { homePageLink } from '@/constants';
import { useApiStore } from '@/providers/apiStoreProvider';

import VerticalIconButton from '@components/VerticalIconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { alpha, styled } from '@mui/material';
import Box from '@mui/material/Box';

export interface TalkToolbarProps {
    data: SingleTalkData;
}

const StyledContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: theme.spacing(0.5, 4),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    backgroundColor: theme.palette.background.paper,
}));

const TalkToolbar: FC<TalkToolbarProps> = ({ data }) => {
    const router = useRouter();
    const handleDelete = useApiStore(state => state.handleDeleteTalk);

    const doDelete = async (): Promise<void> => {
        const result = await handleDelete(data.talk.guid, false);

        if (result?.success) {
            router.push(homePageLink);
        } else if (result?.error) {
            enqueueSnackbar(result.error, { variant: 'error' });
        }
    };

    return (
        <StyledContainer>
            <VerticalIconButton icon={<EditIcon />} square>
                Edit
            </VerticalIconButton>
            <VerticalIconButton
                icon={<DeleteIcon />}
                square
                data-testid="delete-talk"
                onClick={doDelete}
            >
                Delete
            </VerticalIconButton>
        </StyledContainer>
    );
};

export default TalkToolbar;
