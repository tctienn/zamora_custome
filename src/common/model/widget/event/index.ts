export type Event = {
    id: string,
    name: string,
    type: string,
    subjectId: string,
    date: Date,
    fromAt: Date | null,
    toAt: Date | null,
    isAllDay: boolean,
    repeat: string,
    host: string,
    participatingDepartments: string[],
    participants: string[],
    location: string,
    isApproved: boolean,
    description: string,
    remind: string,
    isDeleted: boolean,
    subjectName?: string,
    attachments: string[]
}

export enum EventType {
    SYSTEM,
    ORGANIZATION,
    GROUP,
    PERSONAL
}

export type FullCalendarEvent = {
    backgroundColor: string,
    borderColor: string,
    description: string,
    end: string,
    id: string,
    location: string,
    start: string,
    tag: FullCalendarEventTag,
    textColor: string,
    title: string
}

export type FullCalendarEventTag = {
    color: string, name: string
}

export type DisplayType = {
    icon: string,
    value: string
}