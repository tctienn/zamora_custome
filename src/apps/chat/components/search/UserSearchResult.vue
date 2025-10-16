<template>
  <div
    class='border-round-2xl flex flex-column gap-1 overflow-auto'
    :style='{"height": "calc(100% - 7.25rem)"}'>
    <ChatConversationItem
      v-for='user in userResults'
      :key='user.id'
      class='cursor-pointer'
      :item='userToConversation(user)'
      @click='selectConversation(user)'/>
  </div>
</template>

<script setup lang="ts">
import { find } from 'lodash';
import { storeToRefs } from 'pinia';
import { inject } from 'vue';

import { create1on1Conversation } from '@/apps/chat/api/rest/conversation-api';
import ChatConversationItem from '@/apps/chat/components/conversation/ChatConversationItem.vue';
import type { ChatConversation, ChatMessage } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import { useChatSearchStore } from '@/apps/chat/store/chat-search';
import { User } from '@/common/model/User';

const chatStore = useChatStore();
const chatSearchStore = useChatSearchStore();
const { userResults } = storeToRefs(chatSearchStore);
const { conversations } = storeToRefs(chatStore);

function userToConversation(user: User) {
  return {
    id: '',
    name: user.fullName,
    creatorId: '',
    adminIds: [],
    avatar: user.avatar,
    lastMessage: {} as ChatMessage,
    isGroup: false,
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

function selectConversation(user: User) {
  const existConversation = checkConversationExist(user);
  
  if (existConversation) {
    selectChatConversation(existConversation);
  } else {
    create1on1Conversation(user.id as string).then(response => {
      if (typeof response === 'object') {
        conversations.value.unshift(response);
        subscribeConversation(response.id, response.isGroup);
        selectChatConversation(response);
      }
    });
  }
}

function checkConversationExist(user: User) {
  return find(conversations.value, (conversation) => !conversation.isGroup && conversation.members.includes(user.id as string));
}
</script>

<script lang="ts">
export default { name: 'UserSearchResult' };
</script>