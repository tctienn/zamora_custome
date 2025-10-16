export type Attachment = {
  id?: string;
  name?: string;
  extension?: string;
  size?: number;
  path?: string;
  isDeleted: boolean;
  objectType?: string;
  objectId?: string;
};

export enum AttachType {
  FILE_CHINH = 'FILE_CHINH',
  FILE_PHU = 'FILE_PHU',
  FILE_TRINH_KY = 'FILE_TRINH_KY',
  FILE_PHULUC = 'FILE_PHULUC',
  FILE_LIENQUAN = 'FILE_LIENQUAN',
}

export enum TypeOfTake {
  UPLOAD = 'UPLOAD',
  REFERENT = 'REFERENT',
  PRE_SIGN = 'PRE_SIGN',
  ECM = 'ECM',
}

export type FilesSystemData = {
  docId?: string;
  quote?: string;
  docDate?: Date;
  docCode?: string;
  attachmentId?: string;
  fullName?: string;
  objectId?: string;
  fileName?: string;
  fileExtension?: string;
  filePath?: string;
  size?: string;
  createdBy?: string;
  objectType?: string;
  status?: string;
};
