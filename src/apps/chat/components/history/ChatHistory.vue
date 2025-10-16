<template>
  <div
    class='flex flex-column-reverse flex-grow-1 justify-content-start overflow-auto'>
    <div
      ref='drag'
      class='chat-history flex flex-column-reverse overflow-auto'
      @scroll='onScroll'>
      <template
        v-for='(item, index) of chatHistories'
        :key='item.id'>
        <template v-if='item.type === MessageType[MessageType.MESSAGE]'>
          <RightMessage
            v-if='item.fromUserId === user.id'
            :item='item'/>
          <LeftMessage
            v-else
            :item='item'
            :show-avatar='checkShowAvatarDivider(index)'/>
        </template>

        <template v-if='item.type === MessageType[MessageType.ACTION] && conversation["isGroup"]'>
          <MessageAction :item='item'/>
        </template>

        <MessageTime
          v-if='moment(item.sentAt).isValid()'
          :time='checkShowDateTimeDivider(index)'/>
      </template>
    </div>
  </div>

  <MessageActionMenu ref='messageActionMenu'/>
</template>

<script setup lang='ts'>

import { assign, cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getConversationHistory } from '@/apps/chat/api/rest/chat-api';
import LeftMessage from '@/apps/chat/components/history/LeftMessage.vue';
import MessageAction from '@/apps/chat/components/history/MessageAction.vue';
import MessageActionMenu from '@/apps/chat/components/history/MessageActionMenu.vue';
import MessageTime from '@/apps/chat/components/history/MessageTime.vue';
import RightMessage from '@/apps/chat/components/history/RightMessage.vue';
import { maxChatFileSize } from '@/apps/chat/constants';
import { type ChatMessage, MessageType } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import { DEFAULT_CHAT_LOAD_MESSAGE_SIZE } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { convertFileSize } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { type RestPageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const { moment } = useMoment();

const loadingMore = ref(false);
const chatStore = useChatStore();
const {
  chatHistories,
  chatPageable,
  conversation
} = storeToRefs(chatStore);
const { user } = storeToRefs(useUserStore());
const { t } = useI18n();
const drag = ref<HTMLElement>();

const messageActionMenu = ref();

const sendAttachment = inject('chat-send-files', async (files: FileList) => void {});

function pushUpload() {
  const now = new Date();
  chatStore.addChatHistory({
    id: `${now.getTime()}`,
    fromUserId: user.value.id as string,
    conversationId: conversation.value?.id as string,
    content: '',
    sentAt: now.toISOString(),
    isDeleted: false,
    type: MessageType[MessageType.MESSAGE],
    upload: true
  });
}

function cancelCurrentUpload(id: string) {
  chatHistories.value = chatHistories.value.filter(h => h.id !== id);
}

function sendAttachments(data: {
  files: FileList,
  id: string
}) {
  sendAttachment(data.files)
    .then(() => cancelCurrentUpload(data.id));
}

function checkShowDateTimeDivider(index: number) {
  if (index === chatHistories.value.length - 1 || moment(chatHistories.value[index].sentAt).get('date') !== moment(chatHistories.value[index + 1].sentAt).get('date')) {
    return chatHistories.value[index].sentAt;
  }
  return '';
}

function checkShowAvatarDivider(index: number) {
  return index === chatHistories.value.length - 1 || chatHistories.value[index].fromUserId !== chatHistories.value[index + 1].fromUserId
      || moment(chatHistories.value[index].sentAt).get('date') !== moment(chatHistories.value[index + 1].sentAt).get('date');
}

const pageable = computed(() => ({
  page: chatPageable.value ? chatPageable.value.pageable.pageNumber + 1 : 0,
  size: chatPageable.value ? chatPageable.value.size : DEFAULT_CHAT_LOAD_MESSAGE_SIZE,
  sort: 'time,desc'
}));

function onScroll(event: Event) {
  const {
    scrollTop,
    offsetHeight,
    scrollHeight
  } = event.target as HTMLElement;
  if (offsetHeight - scrollHeight >= scrollTop - scrollHeight * 0.1 && !loadingMore.value
      && chatPageable.value?.totalElements && chatHistories.value.length < chatPageable.value?.totalElements) {
    loadingMore.value = true;

    getConversationHistory({
      conversationId: conversation.value?.id,
      ...pageable.value
    }).then(response => {
      updateHistories(cloneDeep(response));
    });
  }
}

function updateHistories(response: void | RestPageable<ChatMessage>) {
  if (typeof response === 'object') {
    chatStore.addChatHistories(response.content);
    chatPageable.value = assign(response, { content: [] });

    setTimeout(() => {
      loadingMore.value = chatHistories.value.length >= response.totalElements;
    }, 1);

  }
}

function validate(files: FileList) {
  return [...files].map(f => f.size).reduce((p, c) => p + c) < maxChatFileSize;
}

function dragover(e: DragEvent) {
  e.preventDefault();
}

function drop(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer?.files) {
    if (!validate(e.dataTransfer.files)) {
      toastError({ message: `${t('common.invalidFileSizeMessage')} ${convertFileSize(maxChatFileSize)}` });
      return;
    }
    sendAttachments({
      files: e.dataTransfer.files,
      id: ''
    });
  }
}

function toggleMessageActionMenu(payload: {
  event: Event,
  item: ChatMessage
}) {
  messageActionMenu.value.toggleMenu(payload.event, payload.item);
}

watch(() => conversation.value?.id, () => {
  loadingMore.value = false;
});

onMounted(() => {
  EventBus.on('chat-upload', pushUpload);
  EventBus.on('cancel-current-upload', cancelCurrentUpload);
  EventBus.on('send-attachments', sendAttachments);
  EventBus.on('toggle-chat-action-menu', toggleMessageActionMenu);

  drag.value?.addEventListener('dragover', dragover);
  drag.value?.addEventListener('drop', drop);
});

onUnmounted(() => {
  EventBus.off('chat-upload', pushUpload);
  EventBus.off('cancel-current-upload', cancelCurrentUpload);
  EventBus.off('send-attachments', sendAttachments);
  EventBus.off('toggle-chat-action-menu', toggleMessageActionMenu);

  drag.value?.removeEventListener('dragover', dragover);
  drag.value?.removeEventListener('drop', drop);
});
</script>

<script lang='ts'>
export default { name: 'ChatHistory' };
</script>

<style scoped lang='scss'>
</style>