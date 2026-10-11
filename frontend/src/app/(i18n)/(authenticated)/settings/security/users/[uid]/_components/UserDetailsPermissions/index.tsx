'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

import type { components } from '@backend/generated/schema';
import { checkPermissions, Permission } from '@backend/permissions';

import UserDetailsCard from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsCard';

export interface UserDetailsPermissionsProps {
    user: components['schemas']['User'];
}

const UserDetailsPermissions: FC<UserDetailsPermissionsProps> = ({ user }) => {
    const { t } = useTranslation();

    return (
        <UserDetailsCard>
            <CardHeader
                avatar={<LockIcon />}
                title={t('pages.userDetailsPage.permissions')}
                action={
                    <Button
                        endIcon={<EditIcon />}
                        onClick={() =>
                            // eslint-disable-next-line no-alert
                            alert('Not implemented yet')
                        }
                    >
                        Edit
                    </Button>
                }
            />
            <CardContent>
                <List>
                    {Object.values(Permission).map(supportedPermission => {
                        const hasPermission = checkPermissions(
                            user,
                            supportedPermission,
                        );

                        return (
                            <ListItem key={`permission-${supportedPermission}`}>
                                <ListItemText>
                                    {t(
                                        `enums.permission.${Permission[supportedPermission]}`,
                                    )}
                                </ListItemText>
                                {hasPermission ? (
                                    <CheckCircleIcon color="primary" />
                                ) : (
                                    <CancelIcon color="error" />
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            </CardContent>
        </UserDetailsCard>
    );
};

export default UserDetailsPermissions;
