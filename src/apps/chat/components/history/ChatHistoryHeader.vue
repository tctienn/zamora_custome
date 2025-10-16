<template>
  <div class='flex flex-row p-3 surface-card'>
    <div class='flex flex-grow-1 flex-nowrap flex-row grid justify-content-between min-w-0'>
      <div
        class='cursor-pointer flex flex-column'
        :class='conversation["pin"]?"col-6":"col"'
        @click='emits("toggle-conversation-sidebar")'>
        <span class='font-bold line-number-1 text-xl w-full'>{{ conversation["name"] }}</span>
        <small
          v-if='conversation["isGroup"]'
          class=''>{{ t("chat.conversation.memberCount", {count: conversation["members"].length}) }}</small>
      </div>

      <div
        v-if='conversation["pin"]'
        class='align-items-center col-6 column-gap-3 flex flex-row justify-content-end pr-5'>
        <div class='flex flex-column max-w-50'>
          <strong>{{ t("chat.conversation.pinnedMessage") }}</strong>

          <span class='font-italic line-number-1'>
            {{ `"${generatePinMessage()}"` }}
          </span>
        </div>

        <ButtonIcon
          v-tooltip.bottom='t("chat.conversation.unpin")'
          icon='close'
          icon-size='1.5'
          rounded
          text
          @click='unpin'/>
      </div>
    </div>

    <div class='align-items-center flex justify-content-center w-3rem'>
      <ButtonIcon
        icon='more_vert'
        icon-size='1.5'
        rounded
        text
        @click='toggleActionMenu'/>
    </div>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { exportConversationHistory } from '@/apps/chat/api/rest/chat-api';
import { unpinMessage } from '@/apps/chat/api/rest/conversation-api';
import { useChatStore } from '@/apps/chat/store/chat';
import { downloadFile } from '@/common/helpers/file-utils';

const emits = defineEmits(['toggle-conversation-sidebar']);

const chatStore = useChatStore();
const { conversation } = storeToRefs(chatStore);
const { t } = useI18n();

const menuAction = ref();
const menuActions = [
  {
    label: t('chat.conversation.conversationAction.downloadHistory'),
    icon: 'download',
    command: () => {
      exportConversationHistory(conversation.value.id).then(response => {
        if (typeof response === 'object') {
          downloadFile(response, conversation.value.name + '.zip');
        }
      }).catch((error) => {
      });
    }
  }
];

function toggleActionMenu(event: Event) {
  menuAction.value.toggle(event);
}

function generatePinMessage() {
  const { content: pinContent, attachments } = conversation.value?.pin ?? {};

  if (attachments?.length) {
    return `${attachments[0].name}${attachments.length > 1 ? ' ...' : ''}`;
  } else {
    return pinContent as string;
  }
}

function unpin() {
  if (conversation.value) {
    const { id, pin } = conversation.value;
    if (pin?.id) {
      unpinMessage(id, pin.id).then(response => {
        if (typeof response === 'object') {
          conversation.value = response;
          chatStore.updateConversationsPinMessage(response);
        }
      });
    }
  }
}
</script>

<script lang='ts'>
export default { name: 'ChatHistoryHeader' };
</script>