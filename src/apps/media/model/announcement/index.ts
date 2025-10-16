import type { FileAttachment, IMedia } from '@/apps/media/model/media';

export interface IAnnouncement extends IMedia {
    id: string
    title: string,
    groupCode: string,
    groupName: string | undefined | null,
    summary: string,
    content: string,
    publisher: string,
    norder: number,
    isHighlight: string,
    thumbnail: string,
    filesAttach: string,
    filesDeleted: string[],
    subMedias: string[],
    //user info post
    avatar: string
    username: string

    listFileAttachments: FileAttachment[],
    listSubMedia: IAnnouncement[]
    childrenMedia: IMedia[]
}

export interface AnnouncementEdge {
    cursor: string;
    node: IAnnouncement | null;
}

export interface SubAnnouncement {
    id: string,
    title?: string
}