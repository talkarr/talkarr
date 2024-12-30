import type { FC, PropsWithChildren } from 'react';
import { Fragment } from 'react';

import Logo from '@components/Logo';
import NavigationItem from '@components/Navigation/NavigationItem';
import TalksIcon from '@mui/icons-material/RecordVoiceOverRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import type SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';

export interface DividerItem {
    divider: true;
}

export interface NavigationItemBase {
    title: string;
    Icon: typeof SvgIcon;
    subitems?: CommonItemType[];
}

export interface NavigationItemPath extends NavigationItemBase {
    path: string | { href: string; as: string };
}

export interface NavigationItemClick extends NavigationItemBase {
    onClick: () => void;
}

export type NavigationItemType = NavigationItemPath | NavigationItemClick;

export type CommonItemType = DividerItem | NavigationItemType;

export type SplitNavigationItems = NavigationItemType[][];

const navigationItems: CommonItemType[] = [
    {
        title: 'Talks',
        Icon: TalksIcon,
        path: '/',
    },
    {
        divider: true,
    },
    {
        title: 'Settings',
        Icon: SettingsIcon,
        path: '/settings',
    },
];

export const drawerWidth = 240;

export const appbarHeight = 64;

const Navigation: FC<PropsWithChildren> = ({ children }) => {
    const splitItemsByDivider: SplitNavigationItems = navigationItems.reduce(
        (acc, item) => {
            if ('divider' in item && item.divider) {
                acc.push([]);
            } else {
                acc[acc.length - 1].push(item as NavigationItemType);
            }

            return acc;
        },
        [[] as NavigationItemType[]],
    );

    return (
        <Box>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                anchor="left"
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Logo />
                </Box>
                {splitItemsByDivider.map((items, index, { length }) => (
                    <Fragment key={`navigation-item-list-${index}`}>
                        <List>
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
            <Box>
                <AppBar
                    position="fixed"
                    sx={{
                        height: appbarHeight,
                        width: `calc(100% - ${drawerWidth}px)`,
                        ml: `${drawerWidth}px`,
                    }}
                >
                    <Toolbar>
                        <Box display="flex" alignItems="flex-end" gap={1}>
                            <SearchIcon />
                            <TextField
                                size="small"
                                label="Search"
                                variant="standard"
                            />
                        </Box>
                    </Toolbar>
                </AppBar>
                <Container
                    sx={{
                        marginTop: `${appbarHeight}px`,
                    }}
                >
                    {children}
                </Container>
            </Box>
        </Box>
    );
};

export default Navigation;
