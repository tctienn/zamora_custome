import type { FileAttachment } from '@/apps/meeting/model/fileAttachment';

export interface IMeetingRoom {
  id: string;
  name: string;
  code: string;
  address: string;
  status: string;
  norder: number;
  images: FileAttachment[];
  idFilesDelete: string[];
  content?: string;
}

export interface MeetingRoomEdge {
  cursor: string;
  node: IMeetingRoom | null;
}