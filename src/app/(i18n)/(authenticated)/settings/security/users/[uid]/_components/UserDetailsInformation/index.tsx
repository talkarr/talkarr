'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';

import PersonIcon from '@mui/icons-material/Person';

import type { components } from '@backend/generated/schema';

import UserDetailsCard from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsCard';
import UserDetailsItem from '@/app/(i18n)/(authenticated)/settings/security/users/[uid]/_components/UserDetailsItem';

import { longDateTimeFormat } from '@/constants';

import NoSsrMoment from '@components/NoSsrMoment';

export interface UserDetailsInformationProps {
    user: components['schemas']['User'];
}

const UserDetailsInformation: FC<UserDetailsInformationProps> = ({ user }) => {
    const { t } = useTranslation();

    return (
        <UserDetailsCard>
            <CardHeader
                avatar={<PersonIcon />}
                title={t('pages.userDetailsPage.profile')}
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
                        secondary={
                            <NoSsrMoment>
                                {moment =>
                                    moment(user.createdAt).format(
                                        longDateTimeFormat,
                                    )
                                }
                            </NoSsrMoment>
                        }
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.updatedAt')}
                        secondary={
                            <NoSsrMoment>
                                {moment =>
                                    moment(user.updatedAt).format(
                                        longDateTimeFormat,
                                    )
                                }
                            </NoSsrMoment>
                        }
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.accountState')}
                        secondary={
                            user.isActive
                                ? t('pages.userDetailsPage.active')
                                : t('pages.userDetailsPage.deactivated')
                        }
                    />
                    <UserDetailsItem
                        primary={t('pages.userDetailsPage.userId')}
                        secondary={user.id}
                    />
                </List>
            </CardContent>
        </UserDetailsCard>
    );
};

export default UserDetailsInformation;
