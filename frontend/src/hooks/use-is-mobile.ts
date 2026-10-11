import { useMediaQuery, useTheme } from '@mui/material';

const useIsMobile = (): boolean => {
    const theme = useTheme();

    return !useMediaQuery(theme.breakpoints.up('md'));
};

export default useIsMobile;
