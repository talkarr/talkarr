import type { FC, ReactElement, ReactNode } from 'react';
import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

export type ModalCloseReason = 'backdropClick' | 'escapeKeyDown';

export interface ModalProps {
    children: ReactElement | ReactNode;
    open: boolean;
    onClose?: (reason?: ModalCloseReason) => void;
    showCloseButton?: boolean;
    disableAutoFocus?: boolean;
    moreWidth?: boolean;
    keepMounted?: boolean;
    title?: string;
    testID: string;
    closeButtonDisabled?: boolean;
    divider?: boolean;
}

const StyledModal = styled(Modal)(({ theme, open }) => ({
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    overflowY: 'auto',
    zIndex: 1300,
    inset: 0,

    opacity: open ? 1 : 0,
    transition: theme.transitions.create('opacity'),
}));

const OuterWrapper = styled(Box, {
    shouldForwardProp: propName => propName !== 'moreWidth',
})<{ moreWidth?: boolean }>(({ theme, moreWidth }) => ({
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'absolute',
    outline: 'none',

    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    zIndex: 1301,

    pointerEvents: 'none',

    [theme.breakpoints.up('md')]: {
        maxWidth: moreWidth ? 1200 : 696,
        maxHeight: 'calc(100vh - 120px)',
        top: '60px',
        left: 0,
        right: 0,
    },

    [theme.breakpoints.down('md')]: {
        maxWidth: moreWidth ? 'calc(100vw - 40px)' : 'calc(100vw - 80px)',
        maxHeight: 'calc(100vh - 80px)',
        top: '40px',
        left: 0,
        right: 0,
    },
}));

const InnerWrapper = styled(Box)(({ theme }) => ({
    height: 'auto',
    maxHeight: 'inherit',
    maxWidth: 'inherit',
    backgroundColor: theme.palette.background.paper,
    padding: theme.shape.borderRadius * 4,
    [theme.breakpoints.down('md')]: {
        padding: theme.shape.borderRadius * 2,
    },
    borderRadius: theme.shape.borderRadius * 6,
    pointerEvents: 'auto',
}));

const BaseModal: FC<ModalProps> = ({
    open,
    onClose,
    children,
    disableAutoFocus,
    showCloseButton = true,
    moreWidth,
    keepMounted,
    title,
    testID,
    closeButtonDisabled,
    divider,
}) => {
    const handleClose = (
        _event: never,
        reason: 'backdropClick' | 'escapeKeyDown',
    ): void => {
        onClose?.(reason);
    };

    return (
        <StyledModal
            open={open}
            onClose={handleClose}
            disableAutoFocus={disableAutoFocus}
            keepMounted={keepMounted}
            slotProps={{
                backdrop: {
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
                },
            }}
        >
            <OuterWrapper moreWidth={moreWidth}>
                <InnerWrapper>
                    <Box
                        height="100%"
                        position="relative"
                        overflow="auto"
                        zIndex={1302}
                    >
                        <Box
                            mb={2}
                            display="flex"
                            flexDirection="row"
                            width="100%"
                            minHeight="fit-content"
                        >
                            {showCloseButton ? (
                                <IconButton
                                    onClick={() => onClose?.()}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                    }}
                                    data-testid={
                                        testID ? `${testID}-close` : undefined
                                    }
                                    disabled={closeButtonDisabled}
                                >
                                    <CloseIcon />
                                </IconButton>
                            ) : null}
                            {title ? (
                                <Typography
                                    variant="h4"
                                    textAlign="center"
                                    fontWeight={600}
                                    width="100%"
                                    mt={0.5}
                                    paddingX={showCloseButton ? '40px' : 0}
                                >
                                    {title}
                                </Typography>
                            ) : null}
                        </Box>
                        {divider ? <Divider /> : null}
                        <Box p={1} data-testid={testID}>
                            {children}
                        </Box>
                    </Box>
                </InnerWrapper>
            </OuterWrapper>
        </StyledModal>
    );
};

export default BaseModal;
