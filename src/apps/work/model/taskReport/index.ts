import type { TaskAttachment } from '@/apps/work/model/taskAttachment';
import type { TaskEvaluation } from '@/apps/work/model/taskEvaluation';

export interface TaskReport {
  id: string
  taskId: string
  weight: number
  percent: number
  status: ReportStatus
  description: string
  createdBy: string
  createdTime: Date
  lastModifiedBy: string
  lastModifiedTime: Date
  attachments: TaskAttachment[]
  taskEvaluation?: TaskEvaluation
  isAssignerSeen?: boolean
}

export enum ReportStatus {
  WAITING_EVALUATE = 'WAITING_EVALUATE',
  REQUEST_RE_REPORT = 'REQUEST_RE_REPORT',
  RE_REPORTED = 'RE_REPORTED',
  EVALUATED = 'EVALUATED',
}

export interface TaskReportRequest {
  taskId: string
  percent: number
  description?: string
  attachments?: File[]
  weight: number
  forceSave?: boolean
}