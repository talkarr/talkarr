'use client';

import type { FC } from 'react';
import { useMemo } from 'react';

import moment from 'moment';

import { useUiStore } from '@/providers/uiStoreProvider';

import BaseModal from '@components/CustomModal';
import TalkImage from '@components/TalkImage';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AddTalkModal: FC = () => {
    const addTalkModal = useUiStore(state => state.addTalkModal);
    const close = useUiStore(state => state.closeAddTalkModal);

    const open = !!addTalkModal;

    const title = useMemo(() => {
        if (!addTalkModal) {
            return '';
        }

        const year = moment(addTalkModal.date).format('YYYY');

        return `${addTalkModal.title} (${year})`;
    }, [addTalkModal]);

    return (
        <BaseModal open={open} onClose={close} title={title} moreWidth>
            <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                gap={2}
            >
                <Box flex={1} maxWidth="33%">
                    <TalkImage
                        data={addTalkModal || undefined}
                        maxWidth="100%"
                    />
                </Box>
                <Box flex={1}>
                    <Typography variant="body1">
                        {addTalkModal?.description}
                    </Typography>
                </Box>
            </Box>
        </BaseModal>
    );
};

export default AddTalkModal;
