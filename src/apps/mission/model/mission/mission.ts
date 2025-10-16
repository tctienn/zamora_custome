import type { AttachmentInterface } from '@/apps/work/model/attachmentTask';

export enum FilterMissionType {
  SUMMARY = 'SUMMARY',
  MISSIONS = 'MISSIONS',
  ACTIVITIES = 'ACTIVITIES',
  JOBS = 'JOBS',
  NOTES = 'NOTES'
}

export const defaultMission = { createdTime: new Date() } as MissionInterface;
export const defaultFileData: FileAttachmentInterface = {} as FileAttachmentInterface;

export enum StatusMission {
  NEW = 'NEW',
  UNPROCESSED = 'UNPROCESSED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ALL = 'ALL',
  WAITING_FOR_ACCEPT = 'WAITING_FOR_ACCEPT',
  WAITING_FOR_LEADER_APPROVAL = 'WAITING_FOR_LEADER_APPROVAL',
  WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST = 'WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST',
  WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY = 'WAITING_FOR_GENERAL_LEADER_APPROVE_ACTIVITY',
  GENERAL_LEADER_REJECTED_ACTIVITY = 'GENERAL_LEADER_REJECTED_ACTIVITY'
}

export type Board = {
  columns: Column[]
}

export type Column = {
  id: string
  title: string
  order: number
  color: string,
  type: StatusMission,
  listMission: MissionInterface[]
}

export interface MissionAttachment extends AttachmentInterface {
  id: string;
  quote: string;
}

export interface MissionTypeInterface {
  id: string;
  name: string;
}

export enum MissionType {
  TRONG_TAM = 'TRONG_TAM',
  THUONG_QUY = 'THUONG_QUY',
  PHAT_SINH = 'PHAT_SINH'
}

export const missionTypeMap = {
  TRONG_TAM: 'Trọng tâm',
  THUONG_QUY: 'Thường quy',
  PHAT_SINH: 'Phát sinh'
};

export interface MissionInterface {
  node: any;
  id: string;
  missionId: string;
  missionName: string;
  name: string;
  missionType: MissionType;
  code: string;
  budget: string;
  startDate: Date;
  endDate: Date;
  createdTime: Date;
  createdBy: string;
  hostUnit: string;
  description: string;
  relatedParentMissionId?: string;
  relatedParentMissionName?: string;
  status: StatusMission;
  youHasExtensionDeadlineRequest?: string;
  files?: MissionAttachment[];
}

export interface TreeOption {
  key: string;
  value: string;
  label: string;
  children: TreeOption[];
};

export interface MissionTreeInterface {
  missionId: string,
  missionName: string,
  level: number,
  children: MissionTreeInterface[]
}

export interface SearchMissionInput {
  keyword?: string | null;
  year?: string | number | null;
  missionType?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  fromBudget?: string | null;
  toBudget?: string | null;
  status?: string | null;
}

export interface PageableInput {
  page?: number;
  size?: number;
}

export interface NoteInterface {
  handlerName: string;
  grade: string;
  handlerOrganizationName: string;
  handlerOrganizationId: string;
  rating?: number;
  classificationFlag?: boolean;
  jobOnMissionCount: JobCount;
  jobOtherCount: JobOtherCount;
}

export interface JobCount {
  totalJobByMission?: number;
  totalJobOnMissionCompletedAheadOfSchedule?: number;
  totalJobOnMissionCompletedOnTime?: number;
  totalJobOnMissionCompletedLateOnTime?: number;
  totalJobOnMissionInProgress?: number;
  totalJobOnMissionUnprocessed?: number;
  totalJobOnMissionNew?: number;
}

export interface JobOtherCount {
  totalJobOnOther?: number;
  totalJobOtherCompletedAheadOfSchedule?: number;
  totalJobOtherCompletedOnTime?: number;
  totalJobOtherCompletedLateOnTime?: number;
  totalJobOtherInProgress?: number;
  totalJobOtherUnprocessed?: number;
  totalJobOtherNew?: number;
}

export interface SearchNoteInput {
  handlerId?: string | null;
  month?: number | null;
  year?: number;
}

export interface AttachmentInfoInterface {
  fullName: string,
  fileExtension?: string,
  size: number | string,
  isDeleted: boolean,
}

export interface IFileAttachment {
  id?: string;
  size?: string;
  type?: 'CLOUD' | 'LOCAL';
  quote: string;
  attachment: File | any;
  downloadPath?: string;
}
export interface FileAttachmentInterface {
  id?: string;
  size?: string;
  quote: string;
  draftDate: Date;
  attachment: File | any;
  downloadPath?: string;
}

export interface IMissionHistory {
  userEdit: string;
  userEditTime: string;
  note: string;
}

export type SendDeadlineExtension = {
  id?: string
  recordId?: string
  reasonWhyExtension: string,
  newStartDeadline: Date,
  approveByGeneralLeaderStatus?: MissionDeadlineType
  generalLeaderId: string,
  newEndDeadline: Date,
  startDate?: Date,
  endDate?: Date,
  createdBy?: string
}

export enum MissionDeadlineType {
  PENDING = 'PENDING',
  AGREE_EXTENSION_DEADLINE = 'AGREE_EXTENSION_DEADLINE',
  REJECTED_EXTENSION_DEADLINE = 'REJECTED_EXTENSION_DEADLINE'
}
