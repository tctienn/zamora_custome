import type { Organization } from '@/apps/admin/model/organization';
import type { IMeetingRoom } from '@/apps/meeting/model/meeting-room';
import type { Attachment } from '@/common/model/attachment';

export interface MeetingInterface {
  key: string;
  id: string;
  content: string;
  startTime: Date;
  endTime: Date | null;
  hostId: string;
  attendeeIds: string[];
  meetingRoom: IMeetingRoom;
  roomId: string;
  meetingType: MeetingType;
  onlineUrl: string;
  departmentIds: string[];
  mediaDeviceIds: string[];
  setup: string;
  note: string;
  guest: string;
  isImportant: boolean;
  isPrivate: boolean;
  repeat: RepeatMeeting;
  numberAttendees: number;
  status: StatusMeetingEnum;
  filesDeleted: string[];
  fileAttachments: Attachment[];
  creatorId: string;
  isConflict: boolean;
  creationTime: Date;
  periodDays: number;
  reportFilesDeleted: string[];
  reportFileAttachments: Attachment[];
  cronConfig: string;
  projectId: string;
  attendees: AttendeeInterface[];
  organizations: [Organization];
  remind: number;
  remindTimeType: RemindTimeType;
  remindType: RemindType;
  flowId: string;
  createdBy: string;
}

export interface MeetingsMap {
  [key: string]: MeetingInterface[];
}

export interface AttendeeInterface {
  id: string;
  meetingId: string;
  userId: string;
  isHost: boolean;
  seen: boolean;
  seenTime: Date;
  participate: boolean;
  reason: string;
  isDeleted: boolean;
}

export enum StatusMeetingEnum {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  GIVE_BACK = 'GIVE_BACK',
  REFUSE = 'REFUSE',
  APPROVED = 'APPROVED',
  CANCEL = 'CANCEL',
}

export enum RepeatMeeting {
  NO_REPEAT = 'NO_REPEAT',
  DAILY_REPEAT = 'DAILY_REPEAT',
  WEEKLY_REPEAT = 'WEEKLY_REPEAT',
  MONTHLY_REPEAT = 'MONTHLY_REPEAT',
  YEARLY_REPEAT = 'YEARLY_REPEAT',
}

export enum RemindTimeType {
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
}

export enum RemindType {
  NOTIFICATION = 'NOTIFICATION',
  EMAIL = 'EMAIL',
  ALL = 'ALL',
}

export enum FileType {
  ROOM_PHOTO = 'ROOM_PHOTO',
  DOCUMENTS_PREPARED = 'DOCUMENTS_PREPARED',
  REPORT_DOCUMENTS = 'REPORT_DOCUMENTS',
}

export enum MeetingType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ONLINE_OFFLINE = 'ONLINE_OFFLINE',
}

export const defaultMeeting: MeetingInterface = {
  numberAttendees: 0,
  repeat: RepeatMeeting.NO_REPEAT,
  isImportant: false,
  meetingType: MeetingType.OFFLINE,
  remind: 10,
  remindTimeType: RemindTimeType.MINUTE,
  remindType: RemindType.NOTIFICATION,
} as MeetingInterface;

export interface ExportMeetingRequestDTO {
  type: 'MONTHLY' | 'WEEKLY';
  startDate: string;
  endDate: string;
  isConfig: boolean;
  isLeader: boolean;
}

export enum MeetingStatus {
  ALL = 'ALL', // Tất cả
  UPCOMING = 'UPCOMING', // Sắp diễn ra
  ONGOING = 'ONGOING', // Đang diễn ra
  FINISHED = 'FINISHED' // Đã kết thúc
}

