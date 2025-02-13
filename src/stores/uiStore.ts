import type { PartialDeep } from 'type-fest';

import deepmerge from 'deepmerge';
import { createStore } from 'zustand';

import type { SuccessData } from '@backend/types';

import type { ConfirmationModalConfig } from '@/app/_modals/ConfirmationModal';

export type TalkData = SuccessData<'/talks/search', 'get'>['events'][0];

export interface UiState {
    addTalkModal: TalkData | null;
    addFolderModal: boolean;
    confirmationModal: ConfirmationModalConfig | null;
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
}

export type UiStore = UiState & UiActions;

export const defaultUiState: UiState = {
    addTalkModal: null,
    addFolderModal: false,
    confirmationModal: null,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createUiStore = (initialState?: PartialDeep<UiState>) =>
    createStore<UiStore>(set => ({
        ...(deepmerge(defaultUiState, initialState || {}) as UiState),
        openAddTalkModal: talk => set({ addTalkModal: talk }),
        closeAddTalkModal: () => set({ addTalkModal: null }),
        openAddFolderModal: () => set({ addFolderModal: true }),
        closeAddFolderModal: () => set({ addFolderModal: false }),
        showConfirmationModal: config => set({ confirmationModal: config }),
        closeConfirmationModal: () => set({ confirmationModal: null }),
    }));
