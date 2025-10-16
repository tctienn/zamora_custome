import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';

export type Campaign = {
    id?: string;
    code: string;
    recruitmentProposalId: string;
    name: string;
    personInChargeId: string[];
    personInChargeName: string;
    personFollowerId?: string[];
    personFollowerName: string;
    expectedCosts: number;
    workTypeCode: string;
    workTypeName: string;
    workLocationCode: string;
    workLocationName: string;
    positionCode: string;
    positionName: string;
    salaryFrom: number;
    salaryTo: number;
    fromDate: Date;
    toDate: Date;
    createdBy: string;
    createdTime: Date;
    status?: string;
    files: IAttachmentFile[];
};

export enum CampaignStatus {
    TOTAL_ALL = 'TOTALALL',
    PLAN = 'PLAN',
    WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    PAUSE = 'PAUSE',
    GIVE_BACK = 'GIVE_BACK',
    CANCELED = 'CANCELED'
}