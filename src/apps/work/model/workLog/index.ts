import { ActionType, type ILog, type ObjectLogType } from '@/apps/work/model/projectLog';

export interface TaskLog extends ILog {
  objectType: TaskLogType;
  taskId: string;
}

export enum TaskLogType {
  TASK = 'TASK',
  TASK_DISCUSSION = 'TASK_DISCUSSION',
  TASK_ATTACHMENT = 'TASK_ATTACHMENT'
}

export interface TaskHistory extends ILog {
  id: string,
  taskId: string,
  objectType: ObjectLogType;
  objectId: string;
  action: ActionType,
  attribute: TaskAttribute,
  content: string,
  userId: string,
  userName: string,
  time: Date | string,

}

export enum TaskAttribute {
  CHECK_LIST = 'CHECK_LIST',
  CHECK_LIST_GROUP = 'CHECK_LIST_GROUP',
  DEADLINE = 'DEADLINE',
  EVALUATION = 'EVALUATION',
  EXPENSE = 'EXPENSE',
  LABEL = 'LABEL',
  LOCATION = 'LOCATION',
  REPEAT = 'REPEAT',
  RESULT = 'RESULT',
  STATUS = 'STATUS',
  SETTING = 'SETTING',
  REPORT = 'REPORT'
}