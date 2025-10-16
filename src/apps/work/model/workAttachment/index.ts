import type { AttachmentInterface } from '@/apps/work/model/attachmentTask';

export enum AttachmentType {
    TASK = 'TASK',
    PROJECT = 'PROJECT'
}

export interface WorkAttachment extends AttachmentInterface{
    id: string;
    name: string;
    extension: string;
    parentPath: string;
    downloadPath: string;
    size: number;
    objectType: AttachmentType;
    objectId: string;
    createdTime: Date;
    createdBy: string;
    lastModifiedTime: Date;
    lastModifiedBy: string;
    isFolder: boolean;
    parentId: string;
    path: string;
    lastModifiedName: string;
    createdName: string;
    taskName: string;
    orderNo: number;
    taskId: string;
}

export interface ChartInfo {
    totalPdf: number
    totalExcel: number
    totalDoc: number
    totalOther: number
    totalImage: number
    capacity: number
}