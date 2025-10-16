export interface WorkInterface {
  id?: string,
  name: string,
  code: string,
  groupId: string,
  projectId: string,
  assigner: string,
  implementers: string[],
  followers: string[],
  startDate: Date,
  endDate: Date,
  description: string,
  target?: string,
  priority: TaskPriority,
  status: WorkStatusV2,
  createdDate: Date,
  nOrder: number,
  createdBy: string,
  isAssignWithTime?: boolean,
  lastModifiedTimeAction?: Date,
  progress: number,
}

export interface WorkInterfaceInput {
  id?: string,
  name: string,
  code: string,
  groupId?: string,
  projectId?: string,
  assigner: string | null,
  implementers: string[],
  followers?: string[],
  startDate: Date,
  endDate?: Date,
  description?: string,
  target?: string,
  priority: TaskPriority,
  status: WorkStatusV2,
  createdDate?: Date,
  nOrder?: number,
  createdBy?: string,
  isAssignWithTime?: boolean
}

export interface SearchWorkInput {
  keyword?: string,
  projectId?: string,
  workStatus?: WorkStatusV2[],
  workRole?: WorkRoleFilter[],
  userId: string,
}

export function getDefaultWorkInput(): WorkInterfaceInput {
  return {
    //TODO: REMOVE WHEN BUILD
    code: 'MA CV',
    name: 'TEN CV',
    createdDate: new Date(),
    assigner: null,
    implementers: [],
    endDate: new Date(),
    priority: TaskPriority.NORMAL,
    startDate: new Date(),
    status: WorkStatusV2.NOT_STARTED
  };
}

export enum WorkStatusV2 {
  ALL = 'ALL',
  NOT_STARTED = 'NOT_STARTED',
  WORKING = 'WORKING',
  PENDING = 'PENDING',
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export enum TaskPriority {
  HIGH = 'HIGH',
  INTERMEDIATE = 'INTERMEDIATE',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}

export enum WorkRoleFilter {
  ALL = 'ALL',
  IMPLEMENT = 'IMPLEMENT',
  ASSIGN = 'ASSIGN',
  FOLLOW = 'FOLLOW',
  MY_DEPT = 'MY_DEPT',
}

// export const WORK_STATUS_COLOR: Record<WorkStatus, string> = {
//   CANCELED: '',
//   COMPLETED: '',
//   WAITING: '',
//   [WorkStatus.NOT_START]: '#BBBBBB',
//   [WorkStatus.WORKING]: '#2A91D6',
//   [WorkStatus.SUSPEND]: '',
//   [WorkStatus.CLOSED]: '#D87777',
//   [WorkStatus.COMPLETED_ON_TIME]: '#6FBF73',
//   [WorkStatus.WAITING_FOR_REVIEW]: '#33C9DC',
//   [WorkStatus.REJECT]: '',
//   [WorkStatus.COMPLETED_AFTER_DEADLINE]: '#7A87D0',
//   [WorkStatus.HAVE_EVALUATED]: '',
//   [WorkStatus.DELETED]: ''
// };
