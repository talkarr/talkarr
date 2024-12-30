import '@mui/material/styles';
import type { PaletteColor } from '@mui/material';

declare module '@mui/material/styles' {
    interface Palette {
        white: PaletteColor;
        black: PaletteColor;
        light: PaletteColor;
    }

    interface PaletteOptions {
        white?: PaletteColor;
        black?: PaletteColor;
        light?: PaletteColor;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        white: true;
        black: true;
        light: true;
    }
}

declare module '@mui/material/FormHelperText' {
    interface FormHelperTextOwnProps {
        'data-testid': string;
    }
}
