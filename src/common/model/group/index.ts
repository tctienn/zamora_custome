import type { UserLike } from '@/apps/admin/model/userGroup';
import type { Attachment } from '@/common/model';

export type Group = {
    id: string;
    name: string;
    description: string;
    createDate: Date;
    createBy?: string;
    isDelete: boolean;
    status: string;
    groupType: string;
    users: UserLevel[];
    typeOfPrivacy: string;
    avatar: string,
    favoriteUserList: UserLike[]
}

export type GroupNote = {
    id?: string;
    creatorId?: string,
    creator?: string,
    createdAt: Date,
    content: string,
    pinned?: boolean,
    isDeleted: boolean
}

export type GroupTopic = {
    id?: string;
    creatorId?: string,
    creator?: string,
    createdAt?: Date,
    name: string,
    isDeleted: boolean
}

export type GroupTopicComment = {
    id?: string,
    topicId: string,
    content: string,
    senderId?: string,
    sentAt?: string,
    attachments?: string[],
    avatar?: string,
    sender?: string
}

export type TopicComment = {
    id?: string,
    groupId: string,
    topicId: string,
    content: string,
    replyMessageId?: string,
    files?: Attachment[]
}

export type UserLevel = {
    id: string;
    level?: string;
    fullName: string;
    email: string;
    avatar?: string;
}

enum Level {
    MANAGE,
    MEMBER
}

export type GroupCommentFile = {
    id?: string,
    fileId: string,
    content: string,
    senderId?: string,
    sentAt?: string,
    attachments?: string[],
    avatar?: string,
    sender?: string
}

export type GroupAggregation = {
    groupId: string,
    groupName: string,
    groupType: string,
    groupStatus: string,
    groupDescription: string,
    users: [UserAggregation]
}

export type UserAggregation = {
    userId: string,
    userName: string,
    userEmail: string,
    userFullName: string,
    userAvatar: string,
    userLevel: string
}