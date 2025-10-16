import type { MissionAttachment } from '../mission/mission';

export interface IJobReport {
  jobId: string;
  resultContent: string;
  isDraft: boolean;
  files?: MissionAttachment[];
}

export interface IJobSignature {
  jobId: string;
  generalLeaderId: string;
}

export interface IJobApprover {
  jobId: string;
  flag: string
  rejectedAndReturnToLeader: boolean
  rejectedAndReturnToEmployee: boolean
  reasonIfReject: string | null
}