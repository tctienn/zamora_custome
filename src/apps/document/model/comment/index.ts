import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { UserDeptRoleModelInterface } from '@/apps/document/model/ccdoc';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { AttachmentInterface } from '@/apps/work/model/attachmentTask';
import type { UserSupport } from '@/common/model/User';

export interface SendCommentInput {
    receivers: [CommentInput],
    userDeptRole: UserDeptRoleModelInterface,
    contentComment: ContentCommentInput
}

export interface CommentInput {
    toUserId: string,
    toDeptId: string,
    toRoleId: string,
    sendTime: Date,
    sendType: CommentSendType,
    objectId: string,
    objectType: ObjectTypeEnum,
    replyForId: string,
    hasAttachment: boolean,
    toUserName: string,
    toDeptName: string,
    toRoleName: string
}

export type DocComment = {
    id?: string
    fromUserId?: string
    fromDeptId?: string
    fromRoleId?: string
    toUserId?: string
    toDeptId?: string
    toRoleId?: string
    sendTime?: string
    sendType?: CommentSendType
    objectId?: string
    objectType?: ObjectTypeEnum
    replyForId?: string
    content?: string
    isDeleted?: boolean
    hasAttachment?: boolean
    fromUserName?: string
    fromDeptName?: string
    fromRoleName?: string
    toUserName?: string
    toDeptName?: string
    toRoleName?: string
    isRead?: boolean
    readTime?: string
    isCompleted?: boolean
    completeTime?: string
    createdTime?: string
    createdBy?: string
    lastModifiedTime?: string
    lastModifiedBy?: string
    replyComment?: DocComment[]
    attachments?: DocumentAttachment[]
    isEdited?: boolean
    receivers?: DocComment[]
    //for chat
    commentType?: 'log' | 'comment',
    actionName?: string
}

export interface ContentCommentInput {
    lstAttachmentModel: AttachmentInterface | null,
    content: string
}

export interface PrivateCommentDocRequestInput {
    objectType: ObjectTypeEnum,
    objectId: string,
    userSupport?: UserSupport,
    canViewPartner: boolean,
    userDeptRole: UserDeptRoleInput
}

export enum CommentSendType {
    CHAT = 'CHAT', XIN_Y_KIEN = 'XIN_Y_KIEN', TRA_LOI_Y_KIEN = 'TRA_LOI_Y_KIEN'
}

export enum ObjectTypeEnum {
    VB_DEN = 'VB_DEN',
    VB_DI = 'VB_DI',
    PHIEU_TRINH = 'PHIEU_TRINH',
    VB_LIENQUAN = 'VB_LIENQUAN',
    YKIEN = 'YKIEN',
    HO_SO = 'HO_SO'
}

