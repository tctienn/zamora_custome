import type { DocumentAttachment } from '@/apps/document/model/attachment';
import type { CCInfo } from '@/apps/document/model/ccdoc';
import type { DocComment } from '@/apps/document/model/comment';
import { OrganizationType } from '@/apps/document/model/organization';
import type { InComingProcess } from '@/apps/document/model/process/incoming';

export enum DocStatus {
    NHAP = 'NHAP', CHO_XL = 'CHO_XL', DANG_XL = 'DANG_XL', DA_XL = 'DA_XL', BAN_HANH = 'BAN_HANH'
}

export type DocIn = {
    id?: string
    docCode?: string
    docDate?: string
    quote?: string
    identifyCode?: string
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
    deadlineDate?: Date
    deadlineNumber?: number
    numberOfPage?: number
    numberOfCopy?: number
    incomingDate?: Date
    isEnvelope?: boolean
    isRequireAnswer?: boolean
    isLawDocument?: boolean
    isReply?: boolean
    replyFor?: string
    note?: string
    copyFrom?: string
    fileId?: string
    status?: string
    outgoingDocId?: string
    docFromoutId?: string
    publisherType?: number
    sendBackType?: SendBackType
    isDeleted?: boolean
    hasPrivateComment?: boolean

    hasTaskCreated?: boolean

    book?: DocInBook
    attachments?: DocumentAttachment[]
    process?: InComingProcess
    cc?: CCInfo
    comment?: DocComment

    processId?: string,
    commentId?: string,
    ccId?: string,
    flowId?: string
    canDelete?: boolean

}

export interface DocInInput {
    id: string
    isRequireAnswer: boolean
    docTypeId: string,
    docTypeName: string,
    docCode: string,
    incomingDate: Date | null,
    quote: string,
    securityCode: string,
    deadlineDate: Date | null,
    deadlineNumber: number | undefined,
    isEnvelope: boolean
    bookId: string,
    bookNumber: number,
    subBookNumber: number,
    publisherId: string,
    publisherName: string,
    docDate: Date | null,
    priorityCode: string
    note: string,
    publisherType: string
    attachments: any,
    signerId: string,
    signerName: string,
    numberOfCopy: number,
    numberOfPage: number
    isReply: boolean
    isLawDocument: boolean
    areaId: string,
    areaName: string,
    flowId: string
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
    isOnlyLeader: boolean
    deliveryNumber: string
    isProcessing: boolean
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

type DocInBook = {
    id?: string
    docType?: string
    bookNumber?: string
    status?: DocStatus
    bookId?: string
}

export const METHOD_RECIEVES = [
  {
    label: 'Giấy',
    value: 'GIAY'
  },
  {
    label: 'Điện tử',
    value: 'DIEN_TU'
  },
  {
    label: 'Giấy; Điện tử',
    value: 'GIAY_DIEN_TU'
  }
];

export function getMethodRecieves(value: string) {
  return METHOD_RECIEVES.find((v: { label: string, value: string }) => v.value == value)?.label;
}

export function getSecurities(value: string) {
  return SECURITIES.find((v: { label: string, value: string }) => v.value == value)?.label;
}

export function getPriorities(value: string) {
  return PRIORITIES.find((v: { label: string, value: string }) => v.value == value)?.label;
}

export function getNumberSubmission(value: string) {
  return NUMBER_SUBMISSIONS.find((v: { label: string, value: string }) => v.value == value)?.label;
}

export function getTypeOfPresentation(value: string) {
  return TYPE_PRESENTATION.find((v: { label: string, value: string }) => v.value == value)?.label;
}

export enum DocSecurity {
    BINH_THUONG = 'BINH_THUONG',
    MAT = 'MAT',
    TOI_MAT = 'TOI_MAT',
    TUYET_MAT = 'TUYET_MAT'
}

export enum NumberSubmissions {
    FIRST = 'FIRST',
    CONTINUE = 'CONTINUE',
    SIGN = 'SIGN',
    DONE = 'DONE'
}

export enum TypeOfPresentation {
    TRINH_XIN_Y_KIEN = 'TRINH_XIN_Y_KIEN',
    TRINH_VA_BAN_HANH_VAN_BAN = 'TRINH_VA_BAN_HANH_VAN_BAN',
    PHIEU_LAY_Y_KIEN = 'PHIEU_LAY_Y_KIEN'
}

export const SECURITIES = [{
  label: 'Bình thường',
  value: DocSecurity.BINH_THUONG
}, {
  label: 'Mật',
  value: DocSecurity.MAT
}, {
  label: 'Tối mật',
  value: DocSecurity.TOI_MAT
}, {
  label: 'Tuyệt mật',
  value: DocSecurity.TUYET_MAT
}];

export const NUMBER_SUBMISSIONS = [{
  label: 'Trình lần đầu',
  value: NumberSubmissions.FIRST
}, {
  label: 'Trình tiếp',
  value: NumberSubmissions.CONTINUE
}, {
  label: 'Trình ký',
  value: NumberSubmissions.SIGN
}, {
  label: 'Xong',
  value: NumberSubmissions.DONE
}];

export const TYPE_PRESENTATION = [{
  label: 'Trình xin ý kiến',
  value: TypeOfPresentation.TRINH_XIN_Y_KIEN
}, {
  label: 'Trình và ban hành văn bản',
  value: TypeOfPresentation.TRINH_VA_BAN_HANH_VAN_BAN
},
{
  label: 'Phiếu lấy ý kiến',
  value: TypeOfPresentation.PHIEU_LAY_Y_KIEN
}];

export enum DocPriority {
    BINH_THUONG = 'BINH_THUONG',
    HOA_TOC = 'HOA_TOC',
    KHAN = 'KHAN',
    THUONG_KHAN = 'THUONG_KHAN'
}

export const PRIORITIES = [{
  label: 'Bình thường',
  value: DocPriority.BINH_THUONG
}, {
  label: 'Hỏa tốc',
  value: DocPriority.HOA_TOC
}, {
  label: 'Khẩn',
  value: DocPriority.KHAN
}, {
  label: 'Thượng khẩn',
  value: DocPriority.THUONG_KHAN
}];

export const PROCESS_IN_STATUSES = [{
  label: 'document.flowAction.status.all',
  value: [DocStatus.DA_XL, DocStatus.CHO_XL, DocStatus.DANG_XL]
}, {
  label: 'document.flowAction.status.choXl',
  value: [DocStatus.CHO_XL]
}, {
  label: 'document.flowAction.status.dangXl',
  value: [DocStatus.DANG_XL]
}, {
  label: 'document.flowAction.status.daXl',
  value: [DocStatus.DA_XL]
}];

export const PROCESS_OUT_STATUSES = [{
  label: 'document.flowAction.status.all',
  value: [DocStatus.DA_XL, DocStatus.CHO_XL, DocStatus.DANG_XL]
}, {
  label: 'document.flowAction.status.choXl',
  value: [DocStatus.CHO_XL]
}, {
  label: 'document.flowAction.status.dangXl',
  value: [DocStatus.DANG_XL]
}, {
  label: 'document.flowAction.status.daXl',
  value: [DocStatus.DA_XL]
}];

export const DOC_SOURCES = [{
  label: 'Văn bản giấy',
  value: 'GIAY'
}, {
  label: 'Trục liên thông',
  value: 'TRUC'
}, {
  label: 'Nội bộ',
  value: 'INTERNAL'
}];

export const READ_STATUSES = [
  // {
  //   label: 'Tất cả',
  //   value: undefined
  // },
  {
    label: 'Đã đọc',
    value: true
  }, {
    label: 'Chưa đọc',
    value: false
  }];

export enum SendBackType {
    TU_CHOI = 'TU_CHOI',
    THU_HOI = 'THU_HOI'
}
