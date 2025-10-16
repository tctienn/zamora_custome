
import type { ObjectTypeEnum } from '@/apps/document/model/comment';
import { OrganizationType } from '@/apps/document/model/organization';

export enum DocStatus {
    NHAP = 'NHAP', CHO_XL = 'CHO_XL', DANG_XL = 'DANG_XL', DA_XL = 'DA_XL', BAN_HANH = 'BAN_HANH'
}

export type DocComment = {
    chatId?: string
    fromUserId?: string
    fromDepartmentId?: string
    fromRoleId?: string
    toUserId?: string
    toDepartmentId?: string
    sendTime?: string
    jobId?: string
    objectType?: ObjectTypeEnum
    replyForChatId?: string
    content?: string
    isDeleted?: boolean
    hasAttachment?: boolean
    fromUserName?: string
    fromDepartmentName?: string
    fromRoleName?: string
    toUserName?: string
    toDepartmentName?: string
    toRoleId?: string
    toRoleName?: string
    isRead?: boolean
    readTime?: string
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

export type DocumentAttachment = {
    id?: string
    fileExtension: string
    size: number
    downloadPath?: string
    attachment?: string
    isDeleted?: boolean
}

export interface UserDeptRoleInput {
    userId: string,
    userName: string,
    deptId: string,
    deptName: string,
    roleId: string,
    roleName: string,
    type: OrganizationType,
    orgOutName?: string
    delegateId?: string
}