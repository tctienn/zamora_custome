import type { MissionAttachment } from '../mission/mission';

export const defaultJob = {} as JobInput;

export interface SearchJobInput {
  keyword?: string | null;
  year?: string | number | null;
  status?: string | null;
  activityId?: string | null;
  jobType?: string | null;
  mainHandler?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export enum JobType {
  ON_MISSION = 'ON_MISSION',
  OTHER = 'OTHER',
}

export interface JobInput {
  id: string;
  activityId: string;
  activityName?: string;
  missionId: string;
  missionName: string;
  jobName: string;
  jobCode: string;
  jobType: JobType;
  processingDeadline: string;
  status?: string;
  budget: string;
  description: string;
  files?: MissionAttachment[];
}

export interface JobInterface {
  id: string;
  missionId: string;
  missionName: string;
  activityId: string;
  activityName: string;
  startDate: string;
  endDate: string;
  budget: string;
  hostUnit: string;
  jobName: string;
  jobCode: string;
  jobType: string;
  processingDeadline: string;
  jobReportStatus: string | null;
  description: string;
  mainHandler?: string;
  flag?: string;
  isLeaderAccepted: boolean;
  isEmployeeAccepted: boolean;
  youHasExtensionDeadlineRequest?: boolean;
  isJobNeedToApproveByGeneralLeader?: boolean;
  isAssignForLeaderYourself?: boolean;
  isCreator: boolean;
  status?: string;
  createdBy: string;
  createdTime: string;
  assignerList: AssignerInterFace[];
}

interface AssignerInterFace {
  assignId: string;
  assignType: string;
}

export interface EnhancedOrganization {
  assignId: string;
  isMainHandle: boolean;
  isFollower: boolean;
}

export interface AssignedHandler {
  assignId: string;
  isMainHandle: boolean;
  isFollower?: boolean;
}

export interface JobAssignmentInput {
  jobHandleId?: string;
  jobId?: string;
  jobContent: string;
  employmentContact?: 'UNIT' | 'PERSONAL';
  assignList?: AssignedHandler[];
  attachment?: File;
  handleAttachmentFile?: HandleAttachmentFile;
}

export interface HandleAttachmentFile {
  fileId: string;
  fileName: string;
  downloadPath: string;
}

export interface PersonalInterface {
  id: string,
  fullName: string,
  positionName: string[],
  departmentName: string
}

export enum RoleType {
  TRUONG_PHONG = 'TRUONG_PHONG', 
  LANH_DAO = 'LANH_DAO_NHIEM_VU',
   NHAN_VIEN = 'NHAN_VIEN',
    PHO_PHONG = 'PHO_PHONG'
}

export interface IJobHistory {
  id: string;
  jobId: string;
  actionTime: string;
  sendingUnit: string;
  userSendId: string;
  processingUnit: string;
  userProcessingId: string;
  status: string;
  note: string;
}

export interface jobDeadlineExtension {
  id?: string;
  jobId?: string;
  reason?: string;
  newDeadline?: Date | string;
  status: StatusDeadlineExtension;
  createdBy?: string;
  createdTime?: Date;
  isCurrentUserCreatedRequest?: string;
}

export type SendJobDeadlineExtensionEvent = {
  id?: string
  jobId?: string
  reason?: string,
  newDeadline?: Date,
}

export enum StatusDeadlineExtension {
  PENDING = 'PENDING',
  AGREE_EXTENSION_DEADLINE = 'AGREE_EXTENSION_DEADLINE',
  REJECTED_EXTENSION_DEADLINE = 'REJECTED_EXTENSION_DEADLINE'
}

export interface JobStatusCountDto {
  new: number;
  unProcessed: number;
  inProgress: number;
  completed: number;
  totalAll: number;
  totalReportJobToLeader: number;
  totalReportJobGeneralLeaderApproved: number;
  waitingForAccept: number;
}

export interface CountJobByEachDepartmentResult {
  departmentId: string;
  departmentName: string;
  jobStatusCount: JobStatusCountDto;
}