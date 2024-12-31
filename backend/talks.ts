import type { components } from '@backend/generated/schema';
import { getConferenceFromEvent } from '@backend/helper';
import rootLog from '@backend/rootLog';
import type { ConvertDateToStringType } from '@backend/types';
import type { Conference, Event as DbEvent, Person, Tag } from '@prisma/client';
import { Prisma, PrismaClient } from '@prisma/client';

const log = rootLog.child({ label: 'talks' });

export type ApiEvent = components['schemas']['Event'];

export enum AddTalkFailure {
    Duplicate,
    Other,
}

export interface ExtendedDbEvent extends DbEvent {
    persons: Person[];
    tags: Tag[];
    conference: Conference;
}

export const addTalk = async (
    event: ApiEvent,
): Promise<DbEvent | AddTalkFailure> => {
    const prisma = new PrismaClient();

    const conference = await getConferenceFromEvent(event);

    try {
        const createdTalk = await prisma.event.create({
            data: {
                guid: event.guid,
                title: event.title,
                description: event.description,
                date: event.date,
                frontend_link: event.frontend_link,
                persons: {
                    connectOrCreate: event.persons
                        .filter(Boolean)
                        .map(person => ({
                            where: { name: person },
                            create: { name: person },
                        })),
                },
                slug: event.slug,
                tags: {
                    connectOrCreate: event.tags.filter(Boolean).map(tag => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                poster_url: event.poster_url,
                original_language: event.original_language,
                subtitle: event.subtitle,
                thumb_url: event.thumb_url,
                updated_at: event.updated_at,
                release_date: event.release_date,
                conference: {
                    ...(conference
                        ? {
                              connectOrCreate: {
                                  where: {
                                      title: event.conference_title,
                                  },
                                  create: {
                                      acronym: conference.acronym,
                                      description: conference.description,
                                      updated_at: conference.updated_at,
                                      aspect_ratio: conference.aspect_ratio,
                                      schedule_url: conference.schedule_url,
                                      slug: conference.slug,
                                      title: conference.title,
                                      url: conference.url,
                                      logo_url: conference.logo_url,
                                  },
                              },
                          }
                        : {}),
                },
            },
        });

        log.info('Created talk', createdTalk);

        return createdTalk;
    } catch (error) {
        log.error(
            'Error creating talk',
            error instanceof Prisma.PrismaClientKnownRequestError
                ? error.code
                : error,
        );

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return AddTalkFailure.Duplicate;
        }

        return AddTalkFailure.Other;
    } finally {
        await prisma.$disconnect();
    }
};

export const listTalks = async (): Promise<ExtendedDbEvent[]> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.event.findMany({
            include: {
                persons: true,
                tags: true,
                conference: true,
            },
        });
    } catch (error) {
        log.error('Error listing talks', error);

        return [];
    } finally {
        await prisma.$disconnect();
    }
};

export const simpleListTalks = async (): Promise<DbEvent[]> => {
    const prisma = new PrismaClient();

    try {
        return await prisma.event.findMany();
    } catch (error) {
        log.error('Error listing talks', error);

        return [];
    } finally {
        await prisma.$disconnect();
    }
};

export const updateTalk = async (
    guid: string,
    event: ApiEvent,
): Promise<DbEvent | false> => {
    const prisma = new PrismaClient();

    try {
        const updatedTalk = await prisma.event.update({
            where: {
                guid,
            },
            data: {
                title: event.title,
                description: event.description,
                date: event.date,
                frontend_link: event.frontend_link,
                persons: {
                    connectOrCreate: event.persons.map(person => ({
                        where: { name: person },
                        create: { name: person },
                    })),
                },
                slug: event.slug,
                tags: {
                    connectOrCreate: event.tags.map(tag => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                poster_url: event.poster_url,
                original_language: event.original_language,
                subtitle: event.subtitle,
                thumb_url: event.thumb_url,
                updated_at: event.updated_at,
                release_date: event.release_date,
            },
        });

        log.info('Updated talk', updatedTalk);

        return updatedTalk;
    } catch (error) {
        log.error('Error updating talk', error);

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteTalk = async (guid: string): Promise<boolean> => {
    const prisma = new PrismaClient();

    try {
        await prisma.event.delete({
            where: {
                guid,
            },
        });

        return true;
    } catch (error) {
        log.error('Error deleting talk', error);

        return false;
    } finally {
        await prisma.$disconnect();
    }
};
