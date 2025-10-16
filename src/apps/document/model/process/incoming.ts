import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { DocStatus } from '@/apps/document/model/doc/doc-in';
import { type Process, type ProcessInput } from '@/apps/document/model/process/process';

export type IncomingProcessInput = ProcessInput

export interface InComingProcess extends Process {
    id: string,
    docId: string,
    senderId: string,
    senderName: string,
    senderDeptId: string,
    senderDeptName: string,
    senderRoleId: string,
    senderRoleName: string,
    sendTime: string,
    receiverId: string,
    receiverName: string,
    receiverDeptId: string,
    receiverDeptName: string,
    receiverRoleId: string,
    receiverRoleName: string,
    processType: ProcessType,
    sendType: SendType,
    status: DocStatus,
    deadlineDate: string,
    deadlineNumber: number,
    flowInstanceId: string,
    stepId: string,
    actionType: string,
    actionName: string,
    parentId: string,
    isRead: boolean,
    readTime: Date,
    isComplete: boolean,
    completeTime: string,
    note: string,
    orderProcess: number,
    delegateInfoId: string,
    isDeleted: boolean,
    attachments: DocumentAttachment[],
}

export enum ProcessType {
    XL_CHINH = 'XL_CHINH', PHOI_HOP = 'PHOI_HOP', DE_BIET = 'DE_BIET'
}

export enum SendType {
    VAO_SO = 'VAO_SO',
    CHUYEN_XL = 'CHUYEN_XL',
    TRA_LAI = 'TRA_LAI',
    THU_HOI = 'THU_HOI',
    XIN_Y_KIEN = 'XIN_Y_KIEN',
    TRA_LOI_Y_KIEN = 'TRA_LOI_Y_KIEN'
}
