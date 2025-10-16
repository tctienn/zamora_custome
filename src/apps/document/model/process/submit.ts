import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { DocStatus } from '@/apps/document/model/doc/doc-in';
import { SignType } from '@/apps/document/model/doc/doc-out';
import { DocOutProcessType, OutgoingSendType } from '@/apps/document/model/process/outgoing';

export type SubmitProcess = {
  id?: string,
  docSubmitId?: string,
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
