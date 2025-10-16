<template>
  <div
    class='flex flex-column gap-1 overflow-auto'
    :style='{"height": "calc(100% - 7.25rem)"}'>
    <ChatListItem
      v-for='con of conversations'
      :id='`conversation_${con.id}`'
      :key='con.id'
      class='cursor-pointer'
      :class='{"selected": con.id === conversation["id"] }'
      :item='con'
      @click='selectChatConversation(con)'/>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject, type PropType } from 'vue';

import ChatListItem from '@/apps/chat/components/conversation/ChatConversationItem.vue';
import type { ChatConversation } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';

defineProps({
  conversations: {
    type: Array as PropType<ChatConversation[]>,
    default: () => []
  }
});

const selectChatConversation = inject('select-conversation', (conversation: ChatConversation) => {
  return conversation;
});

const chatStore = useChatStore();
const { conversation, } = storeToRefs(chatStore);

</script>

<script lang="ts">
export default { name: 'ChatConversations' };
</script>