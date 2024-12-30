'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { FC } from 'react';

import type {
    NavigationItemType,
    SimpleNavigationItem,
} from '@components/Navigation';
import { styled } from '@mui/material';
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

    const selected = pathname === href;
    const subitemSelected = subItemHrefs.includes(pathname);
    const highlighted = selected || subitemSelected || isSubitem;

    const inner = (
        <>
            <ListItemButton
                selected={selected}
                sx={{
                    paddingLeft: isSubitem ? 4 : undefined,
                }}
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
        >
            <StyledListItem highlighted={highlighted} disablePadding>
                {inner}
            </StyledListItem>
        </Link>
    ) : (
        <StyledListItem
            key={`navigation-item-list-${index}-${itemIndex}`}
            highlighted={highlighted}
            disablePadding
        >
            {inner}
        </StyledListItem>
    );

    return (
        <>
            {component}
            {(selected || subitemSelected) &&
            'subitems' in item &&
            item.subitems?.length ? (
                <List disablePadding>
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
