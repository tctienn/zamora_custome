export type IMedia = {
    id?: string;
    title: string;
    summary?: string;
    content: string;
    type: string;
    size: number;
    publisher?: string;
    thumbnail?: string;
    publishDate: Date
    createdBy: string;
    createdTime: string;
    status: string;
    attachments: FileAttachment[];
    isAllowsEmojis?: boolean;
    isAllowsComment?: boolean;
    viewed: Viewed[];
    comments: Comment[];
    emotions?: Emotion[];
    listFileAttachments: FileAttachment[],
    childrenMedia: IMedia[];
    subMedias: string[]
}

export type Viewed = {
    userId: string
    createdAt: string
}

export type Emotion = {
    userId: string
    emotionType: string
    createdAt?: string
}

export type FileAttachment = {
    id?: string;
    objectId?: string;
    objectType?: string;
    name?: string;
    extension?: string;
    size?: number;
    path?: string;
    isDeleted: boolean;
}

export type Comment = {
    content: string;
    createdBy: string;
    createdTime: string;
    replies: Comment[];
}

export enum MediaType {
    ANNOUNCEMENT = 'ANNOUNCEMENT', NEWS = 'NEWS', HONORS = 'HONORS'
}

export enum MediaStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    GIVE_BACK = 'GIVE_BACK',
    REFUSE = 'REFUSE',
    APPROVED = 'APPROVED',
    EVICT = 'EVICT'
}
