import type { FC, PropsWithChildren } from 'react';

import { alpha, styled, useTheme } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';

import type { ButtonBaseProps, CardHeaderProps } from '@mui/material';

export interface SelectCardProps extends PropsWithChildren {
    title: string;
    selected: boolean;
    onClick: () => void;
    sx?: ButtonBaseProps['sx'];
    multiple?: boolean;
    disabled?: boolean;
    headerProps?: CardHeaderProps;
}

const StyledButtonBase = styled(ButtonBase, {
    shouldForwardProp(propName) {
        return propName !== 'checked';
    },
})<{ checked?: boolean }>(({ theme, disabled, checked }) => ({
    minWidth: 250,
    maxWidth: 300,
    borderRadius: theme.shape.borderRadius * 3,
    textAlign: 'initial',
    color: disabled ? theme.palette.action.disabled : undefined,
    opacity: disabled ? theme.palette.action.disabledOpacity : undefined,
    borderWidth: checked ? 2 : undefined,
    borderColor: checked ? theme.palette.primary.light : undefined,
    borderStyle: 'solid',
    padding: checked ? 0 : 2,

    [theme.breakpoints.up('md')]: {
        width: 300,
    },
}));

const SelectCard: FC<SelectCardProps> = ({
    title,
    selected,
    onClick,
    children,
    sx,
    multiple,
    disabled,
    headerProps,
}) => {
    const theme = useTheme();

    return (
        <StyledButtonBase
            sx={{ ...sx, overflow: 'hidden' }}
            disabled={disabled}
            checked={selected}
        >
            <Card
                onClick={disabled ? undefined : onClick}
                sx={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 3,
                    backgroundColor: selected
                        ? alpha(theme.palette.primary.main, 0.15)
                        : undefined,
                }}
            >
                <CardHeader
                    {...headerProps}
                    title={title}
                    action={
                        multiple ? (
                            <Checkbox
                                checked={selected}
                                disabled={disabled}
                                onClick={disabled ? undefined : onClick}
                            />
                        ) : (
                            <Radio
                                checked={selected}
                                disabled={disabled}
                                onClick={disabled ? undefined : onClick}
                            />
                        )
                    }
                />
                <CardContent>{children}</CardContent>
            </Card>
        </StyledButtonBase>
    );
};

export default SelectCard;
