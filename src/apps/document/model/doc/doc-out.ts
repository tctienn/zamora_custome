import { camelCase } from 'lodash';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { DocComment } from '@/apps/document/model/comment';
import { type DocIn, SendBackType, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocInBook } from '@/apps/document/model/docInBook';
import type { OutgoingProcess } from '@/apps/document/model/process/outgoing';

export type DocOut = {
    id?: string
    bookId?: string
    bookName?: string
    bookNumber?: number
    docCode?: string
    subBookNumber?: string
    docDate?: string
    signerId?: string
    signerName?: string
    publisherId?: string
    publisherName?: string
    docTypeId?: string
    docTypeName?: string
    priorityCode?: string
    securityCode?: string
    areaId?: string
    areaName?: string
    deadlineDate?: string
    deadlineNumber?: number
    numberOfPage?: number
    numberOfCopy?: number
    quote?: string
    isReply?: boolean
    replyFor?: string
    note?: string
    copyFrom?: string
    editorId?: string
    editorName?: string
    editorDeptId?: string
    editorDeptName?: string
    editorRoleId?: string
    editorRoleName?: string
    identifyCode?: string
    qrCode?: string
    fileId?: string
    status?: OutgoingDocStatus
    isLawDocument?: boolean
    signTime?: string
    signType?: SignType
    publishType?: string
    isDeleted?: boolean
    issuerDeptId?: string
    issuerDeptName?: string
    drafterId?: string,
    drafterName?: string,
    drafterDeptId?: string,
    drafterDeptName?: string,
    drafterRoleId?: string,
    drafterRoleName?: string,
    sendBackType?: SendBackType
    advice?: string
    createdTime?: string
    flowId?: string
    isTemporaryFlow?: boolean
    isFromOutsidePaper?: boolean
    isSigned?: boolean
    hasPrivateComment?: boolean
    lastModifiedBy: string
    processId?: string
    commentId?: string
    revokeType?: RevokeType | null

    outGoingAttachments?: DocumentAttachment[]
    outGoingFilesRelate?: DocumentAttachment[]
    docInBook?: DocInBook
    comment?: DocComment
    process?: OutgoingProcess
    lastModifiedTime?: string
}

export interface DocOutInput {
    id: string
    isRequireAnswer: boolean
    docTypeId: string,
    docTypeName: string,
    docTypeCode: string,
    docCode: string,
    incomingDate: Date | null,
    quote: string,
    securityCode: string,
    deadlineDate: Date | null,
    deadlineNumber: number | undefined,
    isEnvelope: boolean
    bookId: string,
    bookNumber: number,
    subBookNumber: number | null | undefined,
    publisherId: string,
    publisherName: string,
    docDate: Date | null,
    priorityCode: string
    note: string,
    publisherType: string
    attachments: any,
    signerId: string,
    signerName: string,
    signTime: Date,
    signType: string,
    numberOfCopy: number,
    numberOfPage: number
    isReply: boolean
    isLawDocument: boolean
    areaId: string,
    issuerDept: any,
    issuerDeptId: string | null,
    issuerDeptName: string | null,
    issuerId: string | null,
    issuerName: string | null,

    drafterId: string | null,
    drafterName: string | null,
    drafterDeptId: string | null,
    drafterDept: any,
    drafterDeptName: string | null,
    drafterDeptCode: string | null,
    drafterRoleId: string | null,
    drafterRoleName: string | null,

    advice: string,
    areaName: string,
    flowId?: string
    isTemporaryFlow?: boolean
    placeSending: string
    userDeptRoleModel: UserDeptRoleInput
    orgOutName: string,
    fieldName: string,
    bookName: string
    createdBy: string
    createdTime: Date
    lastModifiedBy: string
    lastModifiedTime: Date
    stepId: string
    outGoingFilesRelate: DocumentAttachment[]
    outGoingAttachments: DocumentAttachment[]
    receivers: [any]
    editorDept: any
    editorDeptName: string,
    editorDeptId: string,
    editorName: string
    editorId: string
    isFromOutsidePaper?: boolean
    isSigned?: boolean
    incomingDocId?: string
    incomingDoc: DocIn,
    status: OutgoingDocStatus,
    isProcessing?: boolean,
    revokeType?: RevokeType | null
}

export interface RevokePromulgatedDocModel {
    docId: string,
    revokeUserDeptRole: UserDeptRoleInput[]
    reason: string
    userDeptRole: UserDeptRoleInput
}

export enum OutgoingDocStatus {
    DU_THAO = 'DU_THAO',
    DANG_TRINH = 'DANG_TRINH',
    CHO_BAN_HANH = 'CHO_BAN_HANH',
    DA_BAN_HANH = 'DA_BAN_HANH',
}

export enum SignType {
    KY_GIAY = 'KY_GIAY', KY_DIEN_TU = 'KY_DIEN_TU'
}

export enum OutgoingDocAdditionalAction {
    SIGN_CA = 'SIGN_CA', SIGN_APPROVE = 'SIGN_APPROVE'
}

export enum RevokeType {
    REVOKE = 'REVOKE', CANCEL = 'CANCEL'
}

export const DOC_OUT_STATUSES = [{
  label: 'document.flowAction.status.all',
  value: [OutgoingDocStatus.DU_THAO, OutgoingDocStatus.DANG_TRINH, OutgoingDocStatus.CHO_BAN_HANH, OutgoingDocStatus.DA_BAN_HANH]
}, {
  label: `document.flowAction.status.${camelCase(OutgoingDocStatus.DU_THAO.toLowerCase())}`,
  value: [OutgoingDocStatus.DU_THAO]
}, {
  label: `document.flowAction.status.${camelCase(OutgoingDocStatus.DANG_TRINH.toLowerCase())}`,
  value: [OutgoingDocStatus.DANG_TRINH]
}, {
  label: `document.flowAction.status.${camelCase(OutgoingDocStatus.CHO_BAN_HANH.toLowerCase())}`,
  value: [OutgoingDocStatus.CHO_BAN_HANH]
}, {
  label: `document.flowAction.status.${camelCase(OutgoingDocStatus.DA_BAN_HANH.toLowerCase())}`,
  value: [OutgoingDocStatus.DA_BAN_HANH]
}];
