'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';

import moment from 'moment-timezone';

import type { components } from '@backend/generated/schema';

import UserDetailsCard from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsCard';
import UserDetailsItem from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsItem';

import useUserTimezone from '@/hooks/use-user-timezone';

import { longDateTimeFormat } from '@/constants';

export interface UserDetailsInformationProps {
    user: components['schemas']['User'];
}

const UserDetailsInformation: FC<UserDetailsInformationProps> = ({ user }) => {
    const { t } = useTranslation();
    const timezone = useUserTimezone();

    return (
        <UserDetailsCard>
            <CardHeader
                avatar={<PersonIcon />}
                title={t('pages.userDetailsPage.profile')}
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
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.displayName')}
                        secondary={user.displayName ?? t('common.notSet')}
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.email')}
                        secondary={user.email}
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.createdAt')}
                        secondary={moment(user.createdAt)
                            .tz(timezone)
                            .format(longDateTimeFormat)}
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.updatedAt')}
                        secondary={moment(user.updatedAt)
                            .tz(timezone)
                            .format(longDateTimeFormat)}
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.accountState')}
                        secondary={
                            user.isActive
                                ? t('pages.userDetailsPage.active')
                                : t('pages.userDetailsPage.deactivated')
                        }
                        icon={
                            user.isActive ? (
                                <CheckCircleIcon color="primary" />
                            ) : (
                                <CancelIcon color="error" />
                            )
                        }
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.userId')}
                        secondary={user.id}
                        slotProps={{
                            secondary: {
                                fontFamily: 'monospace',
                            },
                        }}
                    />
                </List>
            </CardContent>
        </UserDetailsCard>
    );
};

export default UserDetailsInformation;
