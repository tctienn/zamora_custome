<template>
  <div
    v-if='Object.keys(conversation).length'
    class='chat-history-wrapper col-9 flex flex-row h-full m-0 p-0'>
    <div class='flex flex-column flex-grow-1 h-full'>
      <ChatHistoryHeader @toggle-conversation-sidebar='toggleConversationSidebar'/>

      <AppLoader v-if='loadingHistory'/>
      <ChatHistory v-else/>

      <ChatInput
        :reply-message='replyMessage'
        @reset-reply-message='resetReplyMessage'/>
    </div>

    <ConversationSidebar v-if='conversationSidebarVisible'/>
  </div>

  <div
    v-else
    class='align-items-center col-9 flex h-full justify-content-center m-0 surface-0'>
    <h3>{{ t("chat.conversation.selectChatConversation") }}</h3>
  </div>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatInput from '@/apps/chat/components/ChatInput.vue';
import ConversationSidebar from '@/apps/chat/components/conversation/ConversationSidebar.vue';
import ChatHistory from '@/apps/chat/components/history/ChatHistory.vue';
import ChatHistoryHeader from '@/apps/chat/components/history/ChatHistoryHeader.vue';
import type { ChatMessage } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';

const { conversation, loadingHistory } = storeToRefs(useChatStore());
const { t } = useI18n();

const conversationSidebarVisible = ref(false);
const replyMessage = ref<ChatMessage>();

function reply(message: ChatMessage) {
  replyMessage.value = message;
}

function resetReplyMessage() {
  replyMessage.value = undefined;
}

function toggleConversationSidebar() {
  conversationSidebarVisible.value = !conversationSidebarVisible.value;
}

watch(() => conversation.value?.id, () => {
  conversationSidebarVisible.value = false;
});

provide('reply', reply);

defineExpose({ resetReplyMessage });
</script>

<script lang='ts'>
export default { name: 'ChatMain' };
</script>