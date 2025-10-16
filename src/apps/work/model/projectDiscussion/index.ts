import type { CommentInterface } from '@/apps/media/model/comment';
import type { WorkAttachment } from '@/apps/work/model/workAttachment';
import type { Attachment } from '@/common/model';

export interface ProjectDiscussionInterface extends CommentInterface {
    attachments: Attachment[],
    attachmentPaths: string[],
}

export interface ProjectDiscussion {
    id: string,
    content: string,
    sendId: string,
    createdTime: Date,
    createdBy: string,
    lastModifiedTime: Date,
    lastModifiedBy: string,
    attachments: WorkAttachment[],
    isAttachment: boolean
    downloadPath: string
    extension: string,
    name: string,
    size: number,
    projectId: string,
    isSeen: boolean

    replyId: string,
}

export interface GetMessageInterface {
    id: string,
    content: string,
    sendId: string,
    createdTime: Date,
    createdBy: string,
    lastModifiedTime: Date,
    lastModifiedBy: string
}