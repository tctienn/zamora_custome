<template>
  <div
    class='border-round-2xl flex flex-column gap-1 overflow-auto'
    :style='{"height": "calc(100% - 7.25rem)"}'>
    <ChatConversationItem
      v-for='group in groupResults'
      :key='group.id'
      class='cursor-pointer'
      :item='groupToConversation(group)'
      @click='selectConversation(group)'/>
  </div>
</template>

<script setup lang="ts">
import { find } from 'lodash';
import { storeToRefs } from 'pinia';
import { inject } from 'vue';

import { createGroupConversation } from '@/apps/chat/api/rest/conversation-api';
import ChatConversationItem from '@/apps/chat/components/conversation/ChatConversationItem.vue';
import type { ChatConversation, ChatMessage } from '@/apps/chat/model/chat';
import type { Group } from '@/apps/chat/model/group';
import { useChatStore } from '@/apps/chat/store/chat';
import { useChatSearchStore } from '@/apps/chat/store/chat-search';

const chatStore = useChatStore();
const chatSearchStore = useChatSearchStore();
const { groupResults } = storeToRefs(chatSearchStore);
const { conversations } = storeToRefs(chatStore);

function groupToConversation(group: Group) {
  return {
    id: '',
    name: group.name,
    creatorId: '',
    adminIds: [],
    avatar: '',
    lastMessage: {} as ChatMessage,
    isGroup: true,
    unread: 0,
    members: []
  } as ChatConversation;
}

const selectChatConversation = inject('select-conversation', (conversation: ChatConversation) => {
  return conversation;
});

const subscribeConversation = inject('subscribe-conversation', (conversationId: string, isGroup: boolean) => {
  return {
    conversationId,
    isGroup
  };
});

function selectConversation(group: Group) {
  const existConversation = checkConversationExist(group);

  if (existConversation) {
    selectChatConversation(existConversation);
  } else {
    createGroupConversation(group.id as string).then(response => {
      if (typeof response === 'object') {
        conversations.value.unshift(response);
        subscribeConversation(response.id, response.isGroup);
        selectChatConversation(response);
      }
    });
  }
}

function checkConversationExist(group: Group) {
  return find(conversations.value, (conversation) => conversation.isGroup && conversation.id === group.id);
}
</script>

<script lang="ts">
export default { name: 'GroupSearchResult' };
</script>