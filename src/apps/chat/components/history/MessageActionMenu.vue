<template>
  <ContextMenu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        icon-size='1.2'
        :label='label'/>
    </template>
  </ContextMenu>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { pinMessage } from '@/apps/chat/api/rest/conversation-api';
import type { ChatMessage } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';

const { t } = useI18n();

const chatStore = useChatStore();
const { conversation } = storeToRefs(chatStore);

const menuAction = ref();

const message = ref<ChatMessage>({} as ChatMessage);

const reply = inject('reply', (message: ChatMessage) => {
  return message;
});

const menuActions = [
  {
    label: t('chat.conversation.messageActionMenu.reply'),
    icon: 'reply',
    command: () => {
      reply(message.value);
    }
  },
  {
    label: t('chat.conversation.messageActionMenu.copyText'),
    icon: 'content_copy',
    command: () => {
      navigator.clipboard.writeText(message.value.content);
    }
  },
  {
    label: t('chat.conversation.messageActionMenu.pin'),
    icon: 'push_pin',
    command: () => {
      if (conversation.value && message.value) {
        pinMessage(conversation.value.id, message.value.id).then(response => {
          if (typeof response === 'object') {
            conversation.value = response;
            chatStore.updateConversationsPinMessage(response);
          }
        });
      }
    }
  },
];

function toggleMenu(event: Event, item: ChatMessage) {
  menuAction.value.toggle(event);
  message.value = item;
}

defineExpose({ toggleMenu });
</script>

<script lang='ts'>
export default { name: 'MessageActionMenu' };
</script>