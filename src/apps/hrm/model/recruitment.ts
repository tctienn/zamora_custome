import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';

export type Recruitment = {
    id?: string;
    name: string;
    reasonCode: string;
    reasonName: string;
    positionCode: string;
    positionName: string;
    titleCode?: string;
    titleName?: string;
    departmentId?: string;
    departmentName?: string;
    fromTime: Date;
    toTime: Date;
    currentNumberOfEmployees?: number;
    boundaryQuantity?: number;
    numberOfRecruits: number;
    isRecruitUntilIsEnough?: boolean;
    levelCode?: string;
    levelName?: string;
    majorCode?: string;
    majorName?: string;
    experienceCode?: string;
    experienceName?: string;
    foreignLanguageCode?: string;
    foreignLanguageName?: string;
    ageFrom?: number;
    ageTo?: number;
    gender?: GenderType;
    heightFrom?: string;
    heightTo?: string;
    weightFrom?: string;
    weightTo?: string;
    description?: string;
    status?: string;
    createdBy?: string;
    createdTime?: Date;
    files: IAttachmentFile[];
}

export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum RecruitmentStatus {
  TOTAL_ALL = 'TOTALALL',
  DRAFT = 'DRAFT',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  APPROVED = 'APPROVED'
}