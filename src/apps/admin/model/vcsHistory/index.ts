import type { UserInterface } from '@/apps/admin/model/User';

export interface VcsHistory {
    action: string;
    md5: string;
    time: string;
    user: UserInterface;
    userId: string;
    version: string;
}