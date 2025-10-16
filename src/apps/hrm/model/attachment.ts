import type { PageInfo } from '@/common/model/page';

export type EmployeeAttachment = {
    id?: string
    employeeId?: string
    objectId?: string
    type?: AttachmentType
    name?: string
    extension?: string
    path?: string
    size?: number
    fileName?: string
    file?: File | null // 👈 thêm null
}

export enum AttachmentType {
    PROPOSE = 'PROPOSE',
    VOCATION_TYPE = 'VOCATION_TYPE',
    PLANING = 'PLANING',
    CONTRACT = 'CONTRACT',
    RECRUITMENT_PROPOSAL = 'RECRUITMENT_PROPOSAL',
    RECRUITMENT_CAMPAIGN = 'RECRUITMENT_CAMPAIGN',
    RECRUITMENT_CANDIDATE_AVATAR = 'RECRUITMENT_CANDIDATE_AVATAR',
    INTERVIEW = 'INTERVIEW',
    PROFILE = 'PROFILE',
    IDENTITY_CARD = 'IDENTITY_CARD',
    CERTIFICATE = 'CERTIFICATE',
    TRAINING_PROCESS = 'TRAINING_PROCESS',
    DECISION = 'DECISION',
    INSURANCE = 'INSURANCE',
    OTHER = 'OTHER'
}

export interface FileAttachmentConnection {
    totalCount: number
    pageInfo: PageInfo
    edges: [FileAttachmentEdge]
}

export interface FileAttachment {
    id: string
    objectId: string
    name: string
    employeeId: string
    extension: string
    path: string
    size: number
    type: AttachmentType
    fileName: string
    employeeAvatar: string
    employeeName: string
    createdTime: Date,
    createdBy: string
}

export interface FileAttachmentEdge {
    cursor: string,
    node: FileAttachment
}