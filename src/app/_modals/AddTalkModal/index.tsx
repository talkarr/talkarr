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
        <BaseModal open={open} onClose={close} title={title} moreWidth divider>
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
                    <Typography variant="body2" mb={1}>
                        {addTalkModal?.description}
                    </Typography>
                    <Box>
                        <Typography variant="body1" fontWeight="bold">
                            Date:
                        </Typography>
                        <Typography variant="body1">
                            {moment(addTalkModal?.date).format('MMMM D, YYYY')}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Conference:
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.conference_title}{' '}
                            {addTalkModal?.conference_data?.link ? (
                                <>
                                    (
                                    <a
                                        href={
                                            addTalkModal?.conference_data?.link
                                        }
                                        target="_blank"
                                    >
                                        {addTalkModal?.conference_data?.link}
                                    </a>
                                    )
                                </>
                            ) : null}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {addTalkModal?.persons?.length === 1
                                ? 'Speaker'
                                : 'Speakers'}
                            :
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.persons.join(', ')}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Original language:
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.original_language}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Tags:
                        </Typography>
                        <Typography variant="body1">
                            {addTalkModal?.tags.join(', ')}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </BaseModal>
    );
};

export default AddTalkModal;
