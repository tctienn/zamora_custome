import type { DocType } from '@/apps/document/model/docType';

export interface DocInBook {
    id: string,
    bookId: string,
    bookNumber: number,
    subBookNumber: string,
    docId: string,
    docType: DocTypeEnum,
    docTypeId: string,
    docTypeName: string,
    deadlineDate: Date,
    deadlineNumber: number,
    isDeleted: boolean,
    deptId: string,
    status: StatusEnum,
    flowId: string,
}

export enum DocTypeEnum {
    VB_DEN = 'VB_DEN',
    VB_DI = 'VB_DI',
    PHIEU_TRINH = 'PHIEU_TRINH'
}

export enum StatusEnum {
    NHAP = 'NHAP', CHO_XL = 'CHO_XL', DANG_XL = 'DANG_XL', DA_XL = 'DA_XL'
}