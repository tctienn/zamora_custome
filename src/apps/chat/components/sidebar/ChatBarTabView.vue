<template>
  <TabView
    class='chat-tab h-full'>
    <TabPanel :header='t("common.all")'>
      <ChatConversations :conversations='conversations'/>
    </TabPanel>
    <TabPanel :header='t("chat.conversation.oneOnOneConversation")'>
      <ChatConversations :conversations='filterOneOnOne()'/>
    </TabPanel>
    <TabPanel :header='t("chat.conversation.groupConversation")'>
      <ChatConversations :conversations='filterGroup()'/>
    </TabPanel>
    <TabPanel :header='t("chat.conversation.unreadConversation")'>
      <ChatConversations :conversations='filterUnread()'/>
    </TabPanel>
  </TabView>
</template>

<script setup lang='ts'>
import { filter } from 'lodash';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import ChatConversations from '@/apps/chat/components/conversation/ChatConversations.vue';
import type { ChatConversation } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';

const { t } = useI18n();

const chatStore = useChatStore();
const { conversations } = storeToRefs(chatStore);

function filterOneOnOne(): ChatConversation[] {
  return filter(conversations.value, ['isGroup', false]);
}

function filterGroup(): ChatConversation[] {
  return filter(conversations.value, ['isGroup', true]);
}

function filterUnread(): ChatConversation[] {
  return filter(conversations.value, ({ unread }) => unread > 0);
}
</script>

<script lang='ts'>

export default { name: 'ChatBarTabView' };
</script>