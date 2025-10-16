import type { MediaType } from '@/apps/media/model/media';
import type { Attachment } from '@/common/model/attachment';

export interface CommentInterface {
    id: string,
    content: string,
    objectId: string,
    repliedCommentId?: string,
    type: MediaType,
    createdTime: Date,
    createdBy: string,
    count: number
}

export interface CommentInputInterface {
    id?: string,
    content: string,
    objectId: string,
    type?: MediaType,
    repliedCommentId?: string | null,
    attachments?: Attachment[]
}
