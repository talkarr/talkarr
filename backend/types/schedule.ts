export type ScheduleDurationHhMm = string;
export type ScheduleRoomName = string;
export type SchedulePerson = ScheduleFrabPerson | SchedulePretalxPerson;

export interface C3VocSchedule {
    schedule: Schedule;
    $schema?: string;
    generator?: {
        name?: string;
        version?: string;
        url?: string;
        [k: string]: unknown;
    };
}

export interface Schedule {
    version: string;
    /**
     * base for relative media URIs in this document
     */
    base_url?: string;
    conference: ScheduleConference;
    rooms?: false;
    [k: string]: unknown;
}
export interface ScheduleConference {
    acronym: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    daysCount: number;
    timeslot_duration: string;
    time_zone_name?: string;
    logo?: string;
    colors?: {
        primary?: string;
        background?: string;
        [k: string]: unknown;
    };
    keywords?: string[];
    /**
     * URL to the conference schedule or public website
     */
    url?: string;
    tracks?: {
        name?: string;
        slug?: string;
        color?: string;
        [k: string]: unknown;
    }[];
    rooms?: ScheduleRoom[];
    meta?: {
        [k: string]: unknown;
    };
    days: ScheduleDay[];
}
export interface ScheduleRoom {
    name: string;
    slug?: string;
    type?:
        | 'lecturehall'
        | 'stage'
        | 'workshop'
        | 'outside'
        | 'online'
        | 'project'
        | 'bbb'
        | 'hangar'
        | 'other';
    guid: string;
    stream_id?: string | null;
    /**
     * might also be set as description_de, description_en etc.
     */
    description?: string | null;
    capacity?: number | null;
    url?: string;
    features?: ScheduleRoomFeatures;
    assembly?: ScheduleHubAssembly;
}
export interface ScheduleRoomFeatures {
    recording?:
        | 'record_by_default'
        | 'not_recorded_by_default'
        | 'recording_forbidden'
        | 'recording_not_possible'
        | 'unknown';
    [k: string]: unknown;
}
export interface ScheduleHubAssembly {
    name: string;
    slug: string;
    guid: string;
    url?: string;
    [k: string]: unknown;
}
export interface ScheduleDay {
    index: number;
    date: string;
    day_start: string;
    day_end: string;
    rooms: {
        [k: string]: ScheduleEvent[];
    };
}
export interface ScheduleEvent {
    guid: string;
    code?: string;
    id: number;
    /**
     * absolute URL, or relative to base_url
     */
    logo?: string | null;
    date: string;
    start: string;
    duration: ScheduleDurationHhMm;
    room: ScheduleRoomName;
    slug: string;
    url: string;
    title: string;
    subtitle: string | null;
    track: string | null;
    type: string;
    language: string | null;
    abstract: string | null;
    description?: string | null;
    recording_license?: string;
    do_not_record?: boolean | null;
    do_not_stream?: boolean | string | null;
    persons: SchedulePerson[];
    links: ScheduleLinkOrAttachment[];
    feedback_url?: string;
    attachments?: ScheduleLinkOrAttachment[];
}
export interface ScheduleFrabPerson {
    id: number;
    public_name: string;
    [k: string]: unknown;
}
export interface SchedulePretalxPerson {
    code?: string;
    name: string;
    /**
     * absolute URL, or relative to base_url
     */
    avatar?: string | null;
    biography?: string | null;
    [k: string]: unknown;
}
export interface ScheduleLinkOrAttachment {
    type?:
        | 'slides'
        | 'paper'
        | 'web'
        | 'blog'
        | 'article'
        | 'media'
        | 'related'
        | 'activitypub';
    url: string;
    title?: string;
}
