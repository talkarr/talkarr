import type {
    C3VocSchedule,
    ScheduleConference,
    ScheduleDay,
    ScheduleEvent,
    ScheduleRoom,
} from '@backend/types/schedule';

interface ScheduleOverview {
    events: ScheduleEvent[];
    rooms: ScheduleRoom[] | undefined;
    conference: ScheduleConference;
}

class ScheduleParser {
    private scheduleJson: C3VocSchedule | null = null;

    public parse(scheduleJson: C3VocSchedule | unknown): boolean {
        if (
            typeof scheduleJson === 'object' &&
            scheduleJson !== null &&
            'schedule' in scheduleJson &&
            typeof scheduleJson.schedule === 'object' &&
            scheduleJson.schedule !== null
        ) {
            const { schedule } = scheduleJson;

            if (
                'conference' in schedule &&
                typeof schedule.conference === 'object' &&
                schedule.conference !== null
            ) {
                const { conference } = schedule;

                if ('days' in conference && Array.isArray(conference.days)) {
                    this.scheduleJson = scheduleJson as C3VocSchedule;
                    return true;
                }
            }
        }

        return false;
    }

    public getDays(): ScheduleDay[] {
        if (!this.scheduleJson) {
            throw new Error('Cannot call getEvents(): Call parse() first!');
        }

        return this.scheduleJson.schedule.conference.days;
    }

    public getEvents(): ScheduleEvent[] {
        if (!this.scheduleJson) {
            throw new Error('Cannot call getEvents(): Call parse() first!');
        }

        return this.scheduleJson.schedule.conference.days.flatMap(day =>
            Object.values(day.rooms).flat(),
        );
    }

    public getRooms(): ScheduleRoom[] | undefined {
        if (!this.scheduleJson) {
            throw new Error('Cannot call getEvents(): Call parse() first!');
        }

        return this.scheduleJson.schedule.conference.rooms;
    }

    public getConference(): ScheduleConference {
        if (!this.scheduleJson) {
            throw new Error('Cannot call getEvents(): Call parse() first!');
        }

        return this.scheduleJson.schedule.conference;
    }

    public getOverview(): ScheduleOverview {
        return {
            events: this.getEvents(),
            rooms: this.getRooms(),
            conference: this.getConference(),
        };
    }
}

export default ScheduleParser;
