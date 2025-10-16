export interface Holiday {
    id: string,
    calendar: Date | null,
    type: string,
    description: string
}

export enum holidayType {
    FIXED = 'FIXED', NOT_FIXED = 'NOT_FIXED'
}