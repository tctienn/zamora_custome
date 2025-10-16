import type { TaskAttachment } from '@/apps/work/model/taskAttachment';

export type TaskEvaluationInput = {
  id: string,
  taskId: string,
  ok: boolean,
  point: number,
  description: string,
}

export enum EvaluationType {
  ACCEPT = 'ACCEPT', REJECT = 'REJECT'
}

export interface TaskEvaluation {
  id?: string
  taskId: string
  reportId: string
  evaluationType: EvaluationType
  description: string
  starRating?: number
  percent?: number
  createdBy: string
  createdTime: Date
  lastModifiedBy: string
  lastModifiedTime: Date
  attachments: TaskAttachment[]

}