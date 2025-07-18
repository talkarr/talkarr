'use client';

import type { FC } from 'react';

import { useUiStore } from '@/providers/uiStoreProvider';

import BaseModal from '@components/CustomModal';

const InformationModal: FC = () => {
    const informationModalOpen = useUiStore(store => store.informationModal);
    const closeInformationModal = useUiStore(
        store => store.closeInformationModal,
    );

    return (
        <BaseModal
            open={informationModalOpen}
            onClose={closeInformationModal}
            testID="information-modal"
        >
            <h2>Information Modal</h2>
            <p>This is a placeholder for the information modal content.</p>
        </BaseModal>
    );
};

export default InformationModal;
