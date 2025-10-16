import type { TaskAttachment } from '@/apps/work/model/taskAttachment';

export interface TaskComment {
    id: string,
    content: string,
    sendId: string,
    createdTime: Date,
    createdBy: string,
    lastModifiedTime: Date,
    lastModifiedBy: string,
    attachments: TaskAttachment[],
    extension: string,
    name: string,
    size: number,
    isEdited: boolean,
    replyComment?: TaskComment,
    replyId?: string,
    seenUserIds?: string[]
}
export enum CommentType {
    TASK, PROJECT
}