import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';

import type { Candidate } from './candidate';

export type Interview = {
    id?: string;
    recruitmentCampaignId: string;
    interviewRoundCode: string;
    interviewName: string;
    judgesScoringId: string[];
    judgesScoringName: string;
    judgesEvaluatingId?: string[];
    secretaryId: string;
    scoringFormCode?: string;
    interviewRoom?: string;
    interviewDateFrom: Date;
    interviewDateTo: Date;
    interviewTimeFrom: Date;
    interviewTimeTo: Date;
    createdBy: string;
    createdTime: Date;
    status?: string;
    candidates: Candidate[];
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