'use client';

import type {
    NavigationItemType,
    SplitNavigationItems,
} from '@components/Navigation/navigation';

import { usePathname } from 'next/navigation';

import type { FC, PropsWithChildren } from 'react';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { appbarHeight, drawerWidth } from '@/constants';
import { useUiStore } from '@/providers/ui-store-provider';

import AnimatedArrowIcon from '@components/AnimatedArrowIcon';
import LogoWithText from '@components/LogoWithText';
import { navigationItems } from '@components/Navigation/navigation';
import NavigationItem from '@components/Navigation/NavigationItem';
import NavigationSearch from '@components/Navigation/NavigationSearch';
import NavigationUser from '@components/Navigation/NavigationUser';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const Navigation: FC<PropsWithChildren> = ({ children }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const pathname = usePathname();

    const [open, setOpen] = useState<boolean>(false);

    const openInformationModal = useUiStore(
        store => store.openInformationModal,
    );

    useEffect(() => {
        // close the mobile drawer when the route changes
        setOpen(false);
    }, [pathname]);

    // eslint-disable-next-line unicorn/no-array-reduce
    const splitItemsByDivider: SplitNavigationItems = navigationItems.reduce(
        (acc, item) => {
            if ('divider' in item && item.divider) {
                acc.push([]);
            } else {
                // eslint-disable-next-line unicorn/prefer-at
                acc[acc.length - 1].push(item as NavigationItemType);
            }

            return acc;
        },
        [[] as NavigationItemType[]],
    );

    return (
        <Box data-testid="navigation">
            <Box
                display={{
                    xs: 'none',
                    md: 'block',
                }}
            >
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: theme.palette.background.paper,
                            borderRight: 'none',
                        },
                    }}
                    anchor="left"
                    data-testid="desktop-navigation-drawer"
                >
                    <LogoWithText redirectToHome />
                    {splitItemsByDivider.map((items, index, { length }) => (
                        <Fragment key={`desktop-navigation-item-list-${index}`}>
                            <List
                                disablePadding
                                tabIndex={-1}
                                data-testid="navigation-desktop"
                            >
                                {items.map((item, itemIndex) => (
                                    <NavigationItem
                                        item={item}
                                        key={itemIndex}
                                        itemIndex={itemIndex}
                                        index={index}
                                    />
                                ))}
                            </List>
                            {index < length - 1 ? <Divider /> : null}
                        </Fragment>
                    ))}
                    <Box
                        mt="auto"
                        p={1}
                        display="flex"
                        flexDirection="row"
                        justifyContent="center"
                    >
                        <Typography variant="caption" color="textDisabled">
                            {process.env.NEXT_PUBLIC_CURRENT_VERSION}-
                            {process.env.NEXT_PUBLIC_IS_INSIDE_DOCKER === 'true'
                                ? 'docker'
                                : 'native'}
                            -{process.env.NEXT_PUBLIC_CURRENT_COMMIT_TIMESTAMP}
                        </Typography>
                    </Box>
                </Drawer>
            </Box>
            <Box
                display={{
                    xs: 'block',
                    md: 'none',
                }}
            >
                <Drawer
                    variant="temporary"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: `1px solid rgba(255, 255, 255, 0.05)`,
                        },
                    }}
                    open={open}
                    onClose={() => setOpen(false)}
                    anchor="left"
                    data-testid="mobile-navigation-drawer"
                >
                    <LogoWithText
                        redirectToHome
                        onClick={() => setOpen(false)}
                    />
                    {splitItemsByDivider.map((items, index, { length }) => (
                        <Fragment key={`mobile-navigation-item-list-${index}`}>
                            <List
                                disablePadding
                                tabIndex={-1}
                                data-testid="navigation-mobile"
                            >
                                {items.map((item, itemIndex) => (
                                    <NavigationItem
                                        item={item}
                                        key={itemIndex}
                                        itemIndex={itemIndex}
                                        index={index}
                                    />
                                ))}
                            </List>
                            {index < length - 1 ? <Divider /> : null}
                        </Fragment>
                    ))}
                </Drawer>
            </Box>
            <Box bgcolor="background.paper">
                <AppBar
                    position="fixed"
                    sx={{
                        height: appbarHeight,
                        [theme.breakpoints.up('md')]: {
                            marginLeft: `${drawerWidth}px`,
                            width: `calc(100% - ${drawerWidth}px)`,
                        },
                        width: '100%',
                        boxShadow: 'none',
                    }}
                >
                    <Toolbar
                        style={{
                            height: '100%',
                            backgroundColor: theme.palette.background.paper,
                        }}
                        disableGutters
                        sx={{
                            paddingLeft: 1,
                            paddingRight: 2,
                            gap: 1,
                        }}
                    >
                        <Box
                            display={{ xs: 'flex', md: 'none' }}
                            alignItems="center"
                        >
                            <IconButton
                                color="inherit"
                                onClick={() => setOpen(true)}
                                data-testid="mobile-navigation-drawer-toggle"
                            >
                                <AnimatedArrowIcon open={open} />
                            </IconButton>
                        </Box>
                        <NavigationSearch />
                        <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            gap={2}
                        >
                            <Tooltip
                                title={t('components.navigation.information')}
                                arrow
                            >
                                <IconButton
                                    onClick={() => openInformationModal()}
                                >
                                    <HelpOutlineIcon />
                                </IconButton>
                            </Tooltip>
                            <NavigationUser />
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box
                    bgcolor="background.default"
                    sx={{
                        // make that above only happens for everything above md
                        [theme.breakpoints.up('md')]: {
                            marginLeft: `${drawerWidth}px`,
                            width: `calc(100% - ${drawerWidth}px)`,
                        },
                        width: '100%',
                        marginLeft: 0,
                        marginTop: `${appbarHeight}px`,
                        borderTopLeftRadius: theme.shape.borderRadius * 4,
                        borderTopRightRadius: theme.shape.borderRadius * 4,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Navigation;
