import type { TaskLogType } from '@/apps/work/model/workLog';

export type ObjectLogType = ProjectLogType | TaskLogType

export interface ILog {
  id: string;
  action: ActionType;
  objectType: ObjectLogType;
  objectId: string;
  oldValue?: string;
  newValue?: string;
  createdTime: Date;
  createdBy: string;
}

export interface ProjectLog extends ILog {
  objectType: ProjectLogType;
  projectId: string;
}

export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CLONE = 'CLONE',
  RENAME = 'RENAME',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  REPLY_COMMENT = 'REPLY_COMMENT',
  UPLOAD_ATT = 'UPLOAD_ATT',
  DELETE_ATT = 'DELETE_ATT',
  RENAME_ATT = 'RENAME_ATT',
  DOWNLOAD_ATT = 'DOWNLOAD_ATT'
}

export enum ProjectLogType {
  PROJECT = 'PROJECT',
  DISCUSSION = 'DISCUSSION',
  WORK_ATTACHMENT = 'WORK_ATTACHMENT'
}