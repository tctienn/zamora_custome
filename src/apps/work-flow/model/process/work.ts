import type { Outcome } from '@/apps/work-flow/model/flow';
import type { ObjectInfo } from '@/apps/work-flow/model/process/flow-type';

export type WorkInput = {
  name?: string
  description?: string
  type?: string
  objectId?: string
  flowId?: string
  priority?: Priority
  deadLine?: Date
}

export type StartWorkAssigned = {
  nodeId: string,
  assignedIds: string[],
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export type Work = {
  id: string
  name: string
  description?: string
  priority: Priority
  status: WorkStatus
  startTime?: string
  deadLine?: string
  endTime?: string

  createdTime?: string
  createdBy?: string
  lastModifiedTime?: string
  lastModifiedBy?: string

  currentTasks: Task[]
  objectInfo: ObjectInfo
  stepHistories: StepHistory[]
}

export type Task = {
  id: string
  workId: string
  name: string
  nodeId: string

  assignedId: string
  startTime?: string
  endTime?: string

  status: WorkStatus
  result?: string
  resultLabel?: string
  comment?: string

  needChooseAction?: boolean

  createdTime?: string
  createdBy?: string
  lastModifiedTime?: string
  lastModifiedBy?: string

  objectInfo?: ObjectInfo
  outcomes?: Outcome[]
  work: Work
}

export type StepHistory = {
  id: string
  workId: string
  nodeId: string
  nodeName: string
  taskIds: string

  tasks: Task[]
}

export enum WorkStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
