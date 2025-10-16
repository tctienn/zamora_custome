import { type WorkAttachment } from '@/apps/work/model/workAttachment';

export interface WorkAttachmentByDate {
    date: Date;
    workAttachments: WorkAttachment[];
}