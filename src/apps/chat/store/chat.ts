import { cloneDeep, findIndex, isInteger } from 'lodash';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ChatConversation, ChatMessage } from '@/apps/chat/model/chat';
import { type RestPageable } from '@/common/model/query';

export const useChatStore = defineStore('chat', () => {
  const loadingConversation = ref(false);
  const conversation = ref<ChatConversation>({} as ChatConversation);
  const loadingHistory = ref(false);
  const chatHistories = ref<ChatMessage[]>([]);
  const conversations = ref<ChatConversation[]>([]);
  const chatPageable = ref<RestPageable<ChatMessage>>();
  const totalUnreadMessage = ref(0);

  function addChatHistory(message: ChatMessage) {
    addChatHistories([message], true);
  }

  function addChatHistories(message: ChatMessage[], reverse = false) {
    chatHistories.value = reverse ? [...message, ...chatHistories.value] : [...chatHistories.value, ...message];
  }

  function updateConversationMessage(message: ChatMessage) {
    const clonedConversations = cloneDeep(conversations.value);
    const conversationIndex = findIndex(clonedConversations, ['id', message.conversationId]);
    if (conversationIndex >= 0) {
      const con = clonedConversations[conversationIndex];
      con.lastMessage = message;
      if (con.id !== conversation.value?.id) {
        con.unread = isInteger(con.unread) ? con.unread + 1 : 1;
      }
      clonedConversations.splice(conversationIndex, 1);
      clonedConversations.unshift(con);
    }

    conversations.value = clonedConversations;
  }

  function updateConversationsPinMessage(conversation: ChatConversation) {
    const clonedConversations = cloneDeep(conversations.value);
    const conversationIndex = findIndex(clonedConversations, ['id', conversation.id]);
    if (conversationIndex >= 0) {
      clonedConversations[conversationIndex].pin = conversation.pin;
      conversations.value = clonedConversations;
    }
  }

  function markAsReadConversation(conversationId: string, isGroup: boolean) {
    const clonedConversations = cloneDeep(conversations.value);
    const conversationIndex =
            findIndex(clonedConversations, {
              id: conversationId,
              isGroup
            });
    if (conversationIndex >= 0) {
      const group = clonedConversations[conversationIndex];
      group.unread = 0;
      clonedConversations[conversationIndex] = group;
    }

    conversations.value = clonedConversations;
  }

  function updateConversations(conversation: ChatConversation) {
    const clonedConversations = cloneDeep(conversations.value);
    const conversationIndex = findIndex(clonedConversations, { id: conversation.id, });
    if (conversationIndex >= 0) {
      clonedConversations[conversationIndex] = conversation;
      conversations.value = clonedConversations;
    }
  }

  function removeConversation(conversation: ChatConversation) {
    const clonedConversations = cloneDeep(conversations.value);
    const conversationIndex = findIndex(clonedConversations, { id: conversation.id, });
    if (conversationIndex >= 0) {
      clonedConversations.splice(conversationIndex, 1);
      conversations.value = clonedConversations;
    }
  }

  function resetHistories() {
    chatHistories.value = [];
  }

  return {
    totalUnreadMessage,
    addChatHistory,
    addChatHistories,
    loadingConversation,
    conversation,
    loadingHistory,
    chatHistories,
    conversations,
    chatPageable,
    updateConversationMessage,
    updateConversations,
    markAsReadConversation,
    updateConversationsPinMessage,
    removeConversation,
    resetHistories
  };
}, { persist: true });