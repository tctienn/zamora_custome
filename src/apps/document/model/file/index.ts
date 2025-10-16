export interface FileInterface {
  id: string | undefined;
  fileName: string | undefined;
  fileParent: string | undefined;
  deptIds: string[];
  fileType: string | undefined;
  fileYear: number;
  numOrder: number;
  status: boolean;
  note: string;
  shareUser: any;
  createdTime: any;
  createdBy: string;
}

export enum Permission {
  FULL_PERMISSION = 'FULL_PERMISSION',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  WRITE = 'WRITE',
}

export enum FileActionType {
  UPDATE_NAME = 'UPDATE_NAME',
  ADD_FILE = 'ADD_FILE',
  SHARE_FILE = 'SHARE_FILE',
  ADD_DOC = 'ADD_DOC',
  DELETE_DOC = 'DELETE_DOC',
  READ_FILE = 'READ_FILE',
  DOWNLOAD_DOC = 'DOWNLOAD_DOC',
}

export enum SORT_TYPE {
  DOC_QUOTE = 'DOC_QUOTE',
  DOC_DATE = 'DOC_DATE',
  DOC_NUM = 'DOC_NUM',
  DOC_TYPE = 'DOC_TYPE',
  STATUS = 'STATUS',
}
