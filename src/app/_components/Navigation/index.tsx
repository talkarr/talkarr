import type { FC, PropsWithChildren } from 'react';
import { Fragment } from 'react';

import { pageName } from '@/constants';

import Logo from '@components/Logo';
import NavigationItem from '@components/Navigation/NavigationItem';
import NavigationSearch from '@components/Navigation/NavigationSearch';
import TalksIcon from '@mui/icons-material/RecordVoiceOverRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import type SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export interface DividerItem {
    divider: true;
}

export type SimpleNavigationItem = Pick<NavigationItemType, 'title' | 'path'>;

export interface NavigationItemType {
    title: string;
    Icon: typeof SvgIcon;
    subitems?: SimpleNavigationItem[];
    path: string | { href: string; as: string };
}

export type CommonItemType = DividerItem | NavigationItemType;

export type SplitNavigationItems = NavigationItemType[][];

const navigationItems: CommonItemType[] = [
    {
        title: 'Talks',
        Icon: TalksIcon,
        path: '/',
        subitems: [
            {
                title: 'Add Talk',
                path: '/talks/add',
            },
            {
                title: 'Import Talks',
                path: '/talks/import',
            },
        ],
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
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <Logo />
                    <Typography variant="h3" component="h1" fontWeight="bold">
                        {pageName}
                    </Typography>
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
                        <NavigationSearch />
                    </Toolbar>
                </AppBar>
                <Box
                    sx={{
                        marginTop: `${appbarHeight}px`,
                        marginLeft: `${drawerWidth}px`,
                        paddingX: 4,
                        paddingY: 2,
                        width: `calc(100% - ${drawerWidth}px)`,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Navigation;
