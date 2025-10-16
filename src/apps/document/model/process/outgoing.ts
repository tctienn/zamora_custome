import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { DocStatus } from '@/apps/document/model/doc/doc-in';
import { SignType } from '@/apps/document/model/doc/doc-out';
import type { Process, ProcessInput } from '@/apps/document/model/process/process';

export interface OutgoingProcess extends Process {
  id?: string,
  docId?: string,
  senderId?: string,
  senderName?: string,
  senderDeptId?: string,
  senderDeptName?: string,
  senderRoleId?: string,
  senderRoleName?: string,
  sendTime?: string,
  receiverId?: string,
  receiverName?: string,
  receiverDeptId?: string,
  receiverDeptName?: string,
  receiverRoleId?: string,
  receiverRoleName?: string,
  processType?: DocOutProcessType,
  sendType?: OutgoingSendType,
  status?: DocStatus,
  flowInstanceId?: string,
  stepId?: string,
  actionType?: string,
  actionName?: string,
  parentId?: string,
  isRead?: boolean,
  readTime?: string,
  isComplete?: boolean,
  completeTime?: string,
  note?: string,
  orderProcess?: number,
  delegateInfoId?: string,
  signType?: SignType,
  signTime?: string,
  isDeleted?: boolean,

  attachments?: DocumentAttachment[]
}

export type OutgoingProcessInput = ProcessInput

export enum DocOutProcessType {
  XL_CHINH = 'XL_CHINH', PHOI_HOP = 'PHOI_HOP'
}

export enum OutgoingSendType {
  CHUYEN_XL = 'CHUYEN_XL',
  TU_CHOI = 'TU_CHOI',
  XIN_Y_KIEN = 'XIN_Y_KIEN',
  TRA_LOI_Y_KIEN = 'TRA_LOI_Y_KIEN',
  CHO_BAN_HANH = 'CHO_BAN_HANH'
}
