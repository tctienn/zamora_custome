export type AttachmentSearch = {
  taskId: string
  keyword?: string
  origin?: OriginType[]
}

export enum AttachmentOrigin {
  UPLOAD = 'UPLOAD'
}

export enum TaskAttachmentType {
  TASK = 'TASK', EXPENSE = 'EXPENSE', COMMENT = 'COMMENT', TASK_EXTEND = 'TASK_EXTEND'
}

export enum OriginType {
  UPLOAD = 'UPLOAD', DOCUMENT = 'DOCUMENT', ECM = 'ECM', COMMENT = 'COMMENT', REPORT = 'REPORT', EVALUATE = 'EVALUATE'
}

export type RefAttachment = {
  id: string
  name: string
  size: number
  extension: string
  path: string
}
export type TaskAttachment = {
  id: string
  name: string
  extension: string
  path: string
  size: number
  orderNo: number
  objectType: TaskAttachmentType
  objectId: string
  createdTime: Date
  createdBy: string
  createdName: string
  lastModifiedTime: Date
  lastModifiedBy: string
  lastModifiedName: string
  originType: OriginType
  originId: string
}