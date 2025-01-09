'use client';

import type {
    NavigationItemType,
    SimpleNavigationItem,
} from '@components/Navigation';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import type { FC } from 'react';

import { getFileRoutePath } from '@/utils/route';

import { styled, useTheme } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const StyledListItem = styled(ListItem, {
    shouldForwardProp: prop => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
    boxShadow: highlighted
        ? `inset 4px 0 0 ${theme.palette.primary.main}`
        : undefined,
}));

export interface NavigationItemProps {
    item: SimpleNavigationItem | NavigationItemType;
    index: number;
    itemIndex: number;
    isSubitem?: boolean;
}

const NavigationItem: FC<NavigationItemProps> = ({
    item,
    index,
    itemIndex,
    isSubitem,
}) => {
    const pathname = usePathname();
    const params = useParams();
    const theme = useTheme();

    if (item.visible === false) {
        return null;
    }

    if ('divider' in item && item.divider) {
        return (
            <Divider
                key={`navigation-item-list-${index}-${itemIndex}-divider`}
            />
        );
    }

    const href =
        'path' in item
            ? typeof item.path === 'object'
                ? item.path.href
                : item.path
            : undefined;
    const as =
        'path' in item
            ? typeof item.path === 'object'
                ? item.path.as
                : undefined
            : undefined;

    const subItemHrefs =
        'subitems' in item && item.subitems
            ? item.subitems.map(subitem =>
                  typeof subitem.path === 'object'
                      ? subitem.path.href
                      : subitem.path,
              )
            : [];

    const fileRoutePath = getFileRoutePath(pathname, params);
    const selected = pathname === href;
    const subitemSelected =
        subItemHrefs.includes(pathname) || subItemHrefs.includes(fileRoutePath);
    const highlighted = selected || subitemSelected || isSubitem;

    const inner = (
        <>
            <ListItemButton
                selected={selected}
                sx={{
                    paddingLeft: isSubitem ? 4 : undefined,
                }}
                tabIndex={-1}
            >
                {'Icon' in item && item.Icon ? (
                    <ListItemIcon>
                        <item.Icon />
                    </ListItemIcon>
                ) : null}
                <ListItemText primary={item.title} />
            </ListItemButton>
        </>
    );

    const component = href ? (
        <Link
            key={`navigation-item-list-${index}-${itemIndex}`}
            href={href}
            as={as}
            tabIndex={0}
            className="_custom_link_highlight"
            style={{
                textDecoration: 'none',
                color: 'inherit',
                outline: 'none',
                transition: theme.transitions.create('background-color', {
                    duration: theme.transitions.duration.shortest,
                }),
            }}
        >
            <StyledListItem
                highlighted={highlighted}
                disablePadding
                tabIndex={-1}
            >
                {inner}
            </StyledListItem>
        </Link>
    ) : (
        <StyledListItem
            key={`navigation-item-list-${index}-${itemIndex}`}
            highlighted={highlighted}
            disablePadding
            tabIndex={-1}
        >
            {inner}
        </StyledListItem>
    );

    return (
        <>
            <style jsx global>
                {`
                    ._custom_link_highlight:focus > * {
                        background-color: ${theme.palette.action.hover};
                    }
                `}
            </style>
            {component}
            {(selected || subitemSelected) &&
            'subitems' in item &&
            item.subitems?.length ? (
                <List disablePadding tabIndex={-1}>
                    {item.subitems.map((subitem, subitemIndex) => (
                        <NavigationItem
                            key={`navigation-item-list-${index}-${itemIndex}-subitem-${subitemIndex}`}
                            item={subitem}
                            index={index}
                            itemIndex={subitemIndex}
                            isSubitem
                        />
                    ))}
                </List>
            ) : null}
        </>
    );
};

export default NavigationItem;
