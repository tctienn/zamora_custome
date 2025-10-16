export type Note = {
    id?: string,
    type: NoteType,
    title: string,
    subjectId: string,
    creatorId?: string,
    creator?: string,
    createdAt: Date,
    content: string,
    pinned?: boolean,
    isDeleted: boolean,
    subjectName?: string
}

export enum NoteType {
    ORGANIZATION,
    GROUP,
    PERSONAL
}