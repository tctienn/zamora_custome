import { DataType } from '@/apps/admin/model/object/Property';
import type { TaskCustomer } from '@/apps/work/model/taskCustomer';
import type { ProjectInterface } from '@/apps/work/views/project/model';
import type { Attachment } from '@/common/model';
import { User } from '@/common/model/User';

export type Task = {
  id?: string
  code?: string
  name: string
  weight: number
  description?: string
  type: SourceType | string
  startTime?: Date
  dueTime?: Date
  completionTime?: Date | string
  completionType: CompletionType
  assigner: User | null
  assignerId?: string
  assignerName?: string
  isRepeat: boolean
  isImportant?: boolean
  needEvaluate?: boolean
  remind: boolean
  assessor?: User | null
  assessorId?: string
  assessorName?: string
  percent: number
  autoProgress: boolean
  statusId?: string
  statusName?: string
  parentId?: string
  hasAttachment?: boolean
  hasChecklist?: boolean
  hasLocation?: boolean
  hasCustomer?: boolean
  hasExpense?: boolean
  hasDynamicField?: boolean
  isEvaluated?: boolean
  copyFrom?: string
  createdTime?: Date | string
  createdBy?: string
  lastModifiedTime?: Date
  lastModifiedBy?: string

  participants: Participant[]
  checkLists?: CheckList[]
  checkListCount?: { finished: number, total: number }
  repeatConfig?: TaskRepeatConfig
  commentCount?: number
  oldAttachmentIds?: string[]
  attachments?: Attachment[]
  evaluation?: TaskEvaluation
  children?: Task[]
  parent?: Task | null
  extends?: TaskExtend[]
  locations?: TaskLocation[]
  labels?: TaskLabel[]
  cooperator?: User[] | null
  implementer?: User[]
  implementers?: any[]
  supervisor?: User[] | null
  taskAttachments?: Attachment[]
  files?: FileList
  taskCustomers?: TaskCustomer[]
  project?: ProjectInterface

  groupId?: string;
  projectId?: string;
  target?: string;
  priority: TaskPriority;
  orderNo?: number;
  createdDate?: Date;
  isAssignWithTime?: boolean;

  originCreatedType?: OriginModule
  originCreatedId?: string
  originData?: object
  phaseId?: string

  taskGroup?: any
};

export interface TaskInput {
  id?: string
  code?: string
  name: string
  weight: number
  description?: string
  type: SourceType | string
  startTime?: string
  dueTime?: string
  completionTime?: Date | string
  completionType: CompletionType
  assigner: User | null
  assignerId?: string
  assignerName?: string
  isRepeat: boolean
  isImportant?: boolean
  needEvaluate?: boolean
  remind: boolean
  assessor?: User | null
  assessorId?: string
  assessorName?: string
  percent: number
  autoProgress: boolean
  statusId?: string
  statusName?: string
  parentId?: string
  hasAttachment?: boolean
  hasChecklist?: boolean
  hasLocation?: boolean
  hasCustomer?: boolean
  hasExpense?: boolean
  hasDynamicField?: boolean
  isEvaluated?: boolean
  copyFrom?: string
  participants: Participant[]
  checkLists?: CheckList[]
  checkListCount?: { finished: number, total: number }
  repeatConfig?: TaskRepeatConfig
  commentCount?: number
  oldAttachmentIds?: string[]
  attachments?: Attachment[]
  evaluation?: TaskEvaluation
  children?: Task[]
  parent?: Task | null
  extends?: TaskExtend[]
  locations?: TaskLocation[]
  labels?: TaskLabel[]
  cooperator?: User[] | null
  implementer?: User[]
  supervisor?: User[] | null
  taskAttachments?: Attachment[]
  files?: FileList
  taskCustomers?: TaskCustomer[]

  groupId?: string
  projectId?: string
  target?: string
  priority: TaskPriority
  orderNo?: number
  createdDate?: string
  isAssignWithTime?: boolean

  originCreatedType?: OriginModule
  originCreatedId?: string
  originData?: object
}

export type Work = Partial<ProjectInterface & Task>;

export type TaskLabel = {
  id?: string;
  taskId?: string;
  labelId?: string;
  labelTitle: string;
  labelColor: string;
};

export type TaskEvaluation = {
  id?: string;
  taskId?: string;
  ok?: boolean;
  point?: Float32Array;
  description?: string;
};

export type Participant = {
  id?: string;
  taskId?: string;
  type: string;
  participantId: string;
  participantName?: string;
  participantEmail?: string;
  participantAvatar?: string;
  percent?: number;
  orderNo?: number;
};

export type CheckList = {
  id?: string;
  name: string;
  taskId?: string;
  deadline?: Date;
  isComplete?: boolean;
  completedTime?: Date;
  orderNo?: number;
  implementerId?: string;
  implementerName?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  startTime?: Date;
  endTime?: Date;
  description?: string;
};

export type CheckListGroup = {
  id?: string;
  name: string;
  taskId: string;
  checkLists?: CheckList[];
  orderNo?: number;
};

export type TaskLocation = {
  id?: string;
  taskId?: string;
  name: string;
  address?: string;
  longitude?: number;
  latitude?: number;
};

export type TaskRepeatConfig = {
  id?: string;
  taskId?: string;
  type: string;
  createTimeConfig?: Date;
  daysOfWeek?: string[];
  daysOfMonth?: number[];
  endRepeatDate?: Date | null;
  description?: string;
};

export type TaskSource = {
  id?: string;
  taskId?: string;
  type: SourceType | string;
  sourceId?: string;
  sourceName?: string;
};

export enum ParticipantType {
  IMPLEMENTER = 'IMPLEMENTER',
  COOPERATOR = 'COOPERATOR',
  SUPERVISOR = 'SUPERVISOR',
  FOLLOWER = 'FOLLOWER',
}

export enum CompletionType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export enum RepeatType {
  DAILY,
  WEEKLY,
  DAYS_IN_MONTH,
  END_OF_MONTH,
}

export enum TaskPriority {
  HIGH = 'HIGH',
  INTERMEDIATE = 'INTERMEDIATE',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

// export type TaskInput = {
//   id?: string
//   code?: string
//   name: string
//   weight?: number
//   description?: string
//   startTime?: Date
//   dueTime?: Date
//   completionTime?: Date
//   assignerId?: string
//   isRepeat?: boolean
//   isImportant?: boolean
//   needEvaluate?: boolean
//   remind?: boolean
//   assessorId?: string
//   percent?: number
//   autoProgress?: boolean
//   statusId: string
//   parentId?: string
//   participants?: [ParticipantInput]
// }

type ParticipantInput = {
  type: ParticipantType;
  participantId: string;
  percent: number;
};

export type TaskSetting = {
  tasks: TaskOfTaskSetting[];
  participantTaskSettingResponse: ParticipantTaskSettingResponse[];
  remind: Remind;
};

export type TaskOfTaskSetting = {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  participants: Participant[];
};

export type ParticipantTaskSettingResponse = {
  id: string;
  participantName: string;
  percent: number;
  orderNo: number;
  positionName: string;
};

type Remind = {
  id: string;
  taskId: string;
  warningBeforeDays: number;
  emailAlert: boolean;
  notification: boolean;
};

export type TaskExtend = {
  id: string;
  fieldName: string;
  taskId: string;
  type: DataType;
  value: string;
};

export type SearchTaskInput = {
  keyword?: string;
  projectId?: string;
  taskStatusId?: string[];
  taskRole?: TaskRoleFilter[];
  userId: string;
  fromDateTime?: string;
  toDateTime?: string;
  deptCode?: string;
  isAdminSearch?: boolean;
  isFilterEvaluate?: boolean;
  isFilterDeadlineExtension?: boolean;
};

export type TaskOriginObject = {
  originCreatedType?: OriginModule
  originCreatedId?: string
  originData?: object
}

export enum TaskRoleFilter {
  ALL = 'ALL',
  IMPLEMENT = 'IMPLEMENT',
  ASSIGN = 'ASSIGN',
  FOLLOW = 'FOLLOW',
  MY_DEPT = 'MY_DEPT',
}

export enum TaskImplement {
  PERSONAL,
  ORGANIZATION,
}

export enum SourceType {
  NONE,
  PROJECT,
  DOCUMENT,
  BOARD,
  WORK_FLOW,
}

export enum ShowTypes {
  DATA_LIST,
  TREE_SELECT,
}

export enum DaysOfWeek {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}

export interface ReportMyTaskSearchModel {
  keyword?: string;
  participantId?: string;
  assignerId?: string;
  projectIds?: string[];
  taskGroupId?: string[];
  startTime?: Date;
  dueTime?: Date;
  status?: string;
}

export enum OriginModule {
  DOCUMENT = 'DOCUMENT'
}

export const mapOriginModuleName: Record<OriginModule, string> = { [OriginModule.DOCUMENT]: 'Văn bản' };
