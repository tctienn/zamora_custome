import type { EvaluationType } from '@/apps/work/model/taskEvaluation';
import type { TaskReport } from '@/apps/work/model/taskReport';

export type AcceptReportEvent = ReportEvent
export type RejectReportEvent = ReportEvent
export type ReportEvent = {
  evaluateType: EvaluateType
  report: TaskReport
}

export type EvaluateType = EvaluationType
export type EvaluateSendEvent = {
  description?: string,
  attachments?: File[],
  evaluateDate?: Date,
  percent?: number,
  starRating?: number,
  report: TaskReport
}