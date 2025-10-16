import { TypeOfTake } from '@/common/model/attachment';

export type DocumentAttachment = {
    id?: string
    fullName: string
    fileName?: string
    fileExtension: string
    size: number
    filePath?: string
    attachType?: AttachType
    isDeleted?: boolean
    typeOfTake?: TypeOfTake
    objectId?: string
    isCaSign?: boolean
    isDigitalSign?: boolean
    type?: string
    objectType?: string
}

export enum AttachType {
    FILE_CHINH = 'FILE_CHINH',
    FILE_PHU = 'FILE_PHU',
    FILE_TRINH_KY = 'FILE_TRINH_KY',
    FILE_PHULUC = 'FILE_PHULUC',
    FILE_LIENQUAN = 'FILE_LIENQUAN'
}

export enum AttachmentSignType {
    KY_SO = 'KY_SO',
    KY_DIEN_TU = 'KY_DIEN_TU',
}
