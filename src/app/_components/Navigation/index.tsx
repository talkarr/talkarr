import type {
    NavigationItemType,
    SplitNavigationItems,
} from '@components/Navigation/navigation';

import type { FC, PropsWithChildren } from 'react';
import { Fragment } from 'react';

import { pageName } from '@/constants';

import Logo from '@components/Logo';
import { navigationItems } from '@components/Navigation/navigation';
import NavigationItem from '@components/Navigation/NavigationItem';
import NavigationSearch from '@components/Navigation/NavigationSearch';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

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
                        borderRight: `1px solid rgba(255, 255, 255, 0.05)`,
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
                        <List
                            disablePadding
                            tabIndex={-1}
                            data-testid="navigation"
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
