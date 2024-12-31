import type { components } from '@backend/generated/schema';
import rootLog from '@backend/rootLog';
import type { Event as DbEvent } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const log = rootLog.child({ label: 'talks' });

export type Event = components['schemas']['Event'];

export const addTalk = async (event: Event): Promise<DbEvent | false> => {
    const prisma = new PrismaClient();

    try {
        const createdTalk = await prisma.event.create({
            data: {
                guid: event.guid,
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

        log.info('Created talk', createdTalk);

        return createdTalk;
    } catch (error) {
        log.error('Error creating talk', error);

        return false;
    } finally {
        await prisma.$disconnect();
    }
};

export const listTalks = async (): Promise<DbEvent[]> => {
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
    event: Event,
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
