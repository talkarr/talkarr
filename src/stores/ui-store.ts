import type { License } from '@components/LicenseViewer';
import type { PartialDeep } from 'type-fest';

import deepmerge from 'deepmerge';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { SuccessData } from '@backend/types';

import type { ConfirmationModalConfig } from '@/app/_modals/ConfirmationModal';
import type { RootFolderErrorModalData } from '@/app/_modals/RootFolderErrorModal';

import { licenseList } from '@/utils/licenes';

export type TalkData = SuccessData<'/talks/search', 'get'>['events'][0];

export interface UiState {
    addTalkModal: TalkData | null;
    addFolderModal: boolean;
    confirmationModal: ConfirmationModalConfig | null;
    rootFolderErrorModal: RootFolderErrorModalData | null;
    informationModal: boolean;
    licenseSelected: License;
    versionChangedModal: boolean;
}

export interface UiActions {
    // addTalkModal
    openAddTalkModal: (talk: TalkData) => void;
    closeAddTalkModal: () => void;

    // addFolderModal
    openAddFolderModal: () => void;
    closeAddFolderModal: () => void;

    // showConfirmationModal
    showConfirmationModal: <T extends string = string>(
        config: ConfirmationModalConfig<T>,
    ) => void;
    closeConfirmationModal: () => void;

    // rootFolderErrorModal
    openRootFolderErrorModal: (data: RootFolderErrorModalData) => void;
    closeRootFolderErrorModal: () => void;

    // informationModal
    openInformationModal: () => void;
    closeInformationModal: () => void;

    // licenseSelected
    setLicenseSelected: (license: License) => void;

    // versionChangedModal
    showVersionChangedModal: () => void;
    closeVersionChangedModal: () => void;
}

export type UiStore = UiState & UiActions;

export const defaultUiState: UiState = {
    addTalkModal: null,
    addFolderModal: false,
    confirmationModal: null,
    rootFolderErrorModal: null,
    informationModal: false,
    licenseSelected: licenseList[0],
    versionChangedModal: false,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createUiStore = (initialState?: PartialDeep<UiState>) =>
    createStore<UiStore>()(
        devtools(
            set => ({
                ...(deepmerge(defaultUiState, initialState || {}) as UiState),
                openAddTalkModal: talk => set({ addTalkModal: talk }),
                closeAddTalkModal: () => set({ addTalkModal: null }),
                openAddFolderModal: () => set({ addFolderModal: true }),
                closeAddFolderModal: () => set({ addFolderModal: false }),
                showConfirmationModal: config =>
                    set({ confirmationModal: config }),
                closeConfirmationModal: () => set({ confirmationModal: null }),
                openRootFolderErrorModal: data =>
                    set({ rootFolderErrorModal: data }),
                closeRootFolderErrorModal: () =>
                    set({ rootFolderErrorModal: null }),
                openInformationModal: () => set({ informationModal: true }),
                closeInformationModal: () => set({ informationModal: false }),
                setLicenseSelected: license =>
                    set({ licenseSelected: license }),
                showVersionChangedModal: () =>
                    set({ versionChangedModal: true }),
                closeVersionChangedModal: () =>
                    set({ versionChangedModal: false }),
            }),
            {
                name: 'uiStore',
                enabled: process.env.NODE_ENV === 'development',
            },
        ),
    );
