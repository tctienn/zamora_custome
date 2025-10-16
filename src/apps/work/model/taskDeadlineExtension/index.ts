import type { TaskAttachment } from '@/apps/work/model/taskAttachment';

export interface TaskDeadlineExtension {
  id?: string
  reason?: string
  newDeadline?: Date | string
  status: DeadlineExtensionStatus
  attachments?: TaskAttachment[]
  createdBy?: string
  createdTime?: Date
  lastModifiedBy?: string
  lastModifiedTime?: Date

}

export interface TaskDeadlineExtensionInput {
  reason?: string
  newDeadline?: string
  isAccepted?: boolean
}

export type SearchDeadlineExtension = {
  taskId: string
}

export enum DeadlineExtensionStatus {
  WAITING_ACCEPT = 'WAITING_ACCEPT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}