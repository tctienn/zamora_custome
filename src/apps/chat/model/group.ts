import { User } from '@/common/model/User';

export type Group = {
    id: string,
    name: string,
    isDelete: boolean,
    users: User[]
}