'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { FC } from 'react';

import type { NavigationItemType } from '@components/Navigation';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export interface NavigationItemProps {
    item: NavigationItemType;
    index: number;
    itemIndex: number;
}

const NavigationItem: FC<NavigationItemProps> = ({
    item,
    index,
    itemIndex,
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

    const inner = (
        <ListItemButton
            onClick={'onClick' in item ? item.onClick : undefined}
            selected={pathname === href}
        >
            <ListItemIcon>
                <item.Icon />
            </ListItemIcon>
            <ListItemText primary={item.title} />
        </ListItemButton>
    );

    if (href) {
        return (
            <Link
                key={`navigation-item-list-${index}-${itemIndex}`}
                href={href}
                as={as}
            >
                <ListItem disablePadding>{inner}</ListItem>
            </Link>
        );
    }

    if ('onClick' in item) {
        return (
            <ListItem
                disablePadding
                key={`navigation-item-list-${index}-${itemIndex}`}
            >
                {inner}
            </ListItem>
        );
    }

    return null;
};

export default NavigationItem;
