<template>
  <div
    class='border-round-2xl flex flex-column gap-1 overflow-auto'
    :style='{"height": "calc(100% - 7.25rem)"}'>
    <ChatConversationItem
      v-for='conversation in conversationResults'
      :key='conversation.id'
      class='cursor-pointer'
      :item='conversation'
      @click='selectChatConversation(conversation)'/>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject } from 'vue';

import ChatConversationItem from '@/apps/chat/components/conversation/ChatConversationItem.vue';
import type { ChatConversation } from '@/apps/chat/model/chat';
import { useChatSearchStore } from '@/apps/chat/store/chat-search';

const chatSearchStore = useChatSearchStore();
const { conversationResults } = storeToRefs(chatSearchStore);

const selectChatConversation = inject('select-conversation', (conversation: ChatConversation) => {
  return conversation;
});

</script>

<script lang="ts">
export default { name: 'ConversationSearchResult' };
</script>