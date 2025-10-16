import type { ChatMessage } from '@/apps/chat/model/chat';
import { CHAT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import { objectDataToQueryString } from '@/common/helpers/utils';
import { type RestPageable } from '@/common/model/query';

function getConversationHistory(data: object) {
  return baseApi.get<RestPageable<ChatMessage>>(`${CHAT_URL}/history?${objectDataToQueryString(data)}`);
}

function exportConversationHistory(conversationId: string) {
  return baseApi.download<Blob>(`${CHAT_URL}/history/export?conversationId=${conversationId}`, undefined);
}

export {
  exportConversationHistory,
  getConversationHistory
};