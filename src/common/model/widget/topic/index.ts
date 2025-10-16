import { EventType } from '@/common/model/widget/event';

export type Topic = {
    id?: string,
    type: EventType,
    subjectId: string,
    creatorId?: string,
    creator?: string,
    createdAt?: Date,
    name: string,
    isDeleted: boolean
}

export type TopicComment = {
    id?: string,
    topicId: string,
    content: string,
    senderId?: string,
    sentAt?: string,
    attachments?: string[],
    avatar?: string,
    sender?: string
}

export enum TopicType {
    ORGANIZATION,
    GROUP,
}