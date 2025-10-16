import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ChatAttachment } from '@/apps/ecm/model/chat';
import type { ChatConversation } from '@/common/model';

export const useEcmChatStore = defineStore('ecm_chat', () => {
  const chatConversations = ref<ChatConversation[]>([]);
  const chatConversation = ref<ChatConversation>({} as ChatConversation);
  const chatConversationLayout = ref<'list' | 'grid'>('list');
  const chatAttachments = ref<ChatAttachment[]>([]);
  const chatSelectedAttachments = ref<ChatAttachment[]>([]);

  const chatAttachmentLayout = ref<'list' | 'grid'>('list');
  const chatAttachmentSortOption = ref<{ column: string, direction: 'asc' | 'desc' }>();
  const chatAttachmentFileTypeFilter = ref<{ value: string, icon: string, label: string }>();

  return {
    chatAttachmentLayout,
    chatAttachmentSortOption,
    chatAttachmentFileTypeFilter,
    chatConversations,
    chatConversation,
    chatAttachments,
    chatConversationLayout,
    chatSelectedAttachments,
  };
}, { persist: true });