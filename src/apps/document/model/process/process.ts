import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { DocStatus } from '@/apps/document/model/doc/doc-in';
import { ProcessType } from '@/apps/document/model/process/incoming';

export interface ProcessInput {
  receiverId: string
  receiverName: string
  receiverDeptId: string
  receiverDeptName: string
  receiverRoleId: string
  receiverRoleName: string
  deadlineDate: Date
  deadlineNumber: number
  processType: ProcessType
}

export interface Process {
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
  processType?: string,
  deadlineDate?: string,
  deadlineNumber?: number,
  flowInstanceId?: string,
  stepId?: string,
  actionType?: string,
  actionName?: string,
  parentId?: string,
  isRead?: boolean,
  readTime?: Date | string,
  isComplete?: boolean,
  completeTime?: string,
  note?: string,
  orderProcess?: number,
  delegateInfoId?: string,
  isDeleted?: boolean,
  status?: DocStatus,
  splitStatus?: SplitStatus,
  attachments?: DocumentAttachment[]
}

export enum SplitStatus {
  NONE = 'NONE',
  NOT_DONE = 'NOT_DONE',
  DONE = 'DONE',
}
