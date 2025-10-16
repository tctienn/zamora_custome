import type { FileAttachment } from '@/apps/meeting/model/fileAttachment';

export interface IMediaDevice {
  id: string;
  name: string;
  code: string;
  description: string;
  mediaOrDevice: boolean;
  status: string;
  norder: number;
  images: FileAttachment[];
  idFilesDelete: string[];
}

export interface MediaDeviceEdge {
  cursor: string;
  node: IMediaDevice | null;
}
