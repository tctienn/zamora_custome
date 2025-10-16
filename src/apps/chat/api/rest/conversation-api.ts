import type { ChatConversation } from '@/apps/chat/model/chat';
import type { ChatAttachment } from '@/apps/ecm/model/chat';
import { CHAT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import { User } from '@/common/model/User';

function createConversation(data: FormData) {
  return baseApi.postWithFile<ChatConversation>(`${CHAT_URL}/conversation/create`, data);
}

function getConversations() {
  return baseApi.get<ChatConversation[]>(`${CHAT_URL}/conversation`, undefined);
}

function readConversation(conversationId: string) {
  return baseApi.put<ChatConversation[]>(`${CHAT_URL}/conversation/${conversationId}/read`, undefined);
}

function create1on1Conversation(userId: string) {
  return baseApi.post<ChatConversation>(`${CHAT_URL}/conversation/create/1on1-conversation?userId=${userId}`, undefined);
}

function createGroupConversation(groupId: string) {
  return baseApi.post<ChatConversation>(`${CHAT_URL}/conversation/create/group-conversation?groupId=${groupId}`, undefined);
}

function pinMessage(conversationId: string, messageId: string) {
  return baseApi.put<ChatConversation>(`${CHAT_URL}/conversation/${conversationId}/pin-message/${messageId}`, undefined);
}

function unpinMessage(conversationId: string, messageId: string) {
  return baseApi.put<ChatConversation>(`${CHAT_URL}/conversation/${conversationId}/unpin-message/${messageId}`, undefined);
}

function getConversationMembers(conversationId: string) {
  return baseApi.get<User[]>(`${CHAT_URL}/conversation/${conversationId}/members`);
}

function addConversationMembers(conversationId: string, memberIds: string[]) {
  return baseApi.put<ChatConversation>(`${CHAT_URL}/conversation/${conversationId}/members/add?memberIds=${memberIds.join(',')}`, undefined);
}

function removeConversationMember(conversationId: string, memberId: string) {
  return baseApi.put<ChatConversation>(`${CHAT_URL}/conversation/${conversationId}/members/remove/${memberId}`, undefined);
}

function deleteConversation(conversationId: string) {
  return baseApi.del<ChatConversation>(`${CHAT_URL}/conversation/${conversationId}`, undefined);
}

function updateConversationName(conversationId: string, conversationName: string) {
  return baseApi.put<ChatConversation>(`${CHAT_URL}/conversation/update-name/${conversationId}`, { name: conversationName });
}

function getConversationAttachments(conversationId: string) {
  return baseApi.get<ChatAttachment[]>(`${CHAT_URL}/conversation/${conversationId}/attachments`);
}

export {
  addConversationMembers,
  create1on1Conversation,
  createConversation,
  createGroupConversation,
  deleteConversation,
  getConversationAttachments,
  getConversationMembers,
  getConversations,
  pinMessage,
  readConversation,
  removeConversationMember,
  unpinMessage,
  updateConversationName
};