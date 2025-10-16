import type { Attachment } from '@/common/model';

export type Message = {
    id?: string,
    conversationId: string,
    content: string,
    replyMessageId?: string,
    files?: Attachment[]
}

export type ChatConversation = {
    id: string,
    name: string,
    creatorId: string,
    adminIds: string[],
    avatar: string,
    lastMessage?: ChatMessage,
    isGroup: boolean,
    unread: number,
    members: string[],
    pin?: ChatMessage
}

export type ChatMessage = {
    id: string,
    fromUserId: string,
    conversationId: string,
    content: string,
    sentAt: string,
    attachments?: Attachment[],
    upload?: boolean,
    isDeleted: boolean,
    replyMessage?: ChatMessage,
    type: string,
    avatar?: string,
    sender?: string,
}
export enum MessageType {
    MESSAGE,
    ACTION
}

export interface PrivateChannelMessage {
    type: string,
    metadata: ChatConversation
}

export enum PrivateChannelMessageType {
    NEW_CONVERSATION,
    SUBSCRIBE,
    UNSUBSCRIBE
}