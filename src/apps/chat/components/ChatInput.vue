<template>
  <div class='align-items-center flex flex-row justify-content-center p-3 surface-card'>
    <div class='w-full'>
      <div
        v-if='Object.keys(replyMessage).length'
        class='border-round-right flex flex-row justify-content-between mb-2 pr-2 surface-ground'>
        <ReplyMessage :item='replyMessage as ChatMessage'/>

        <ButtonIcon
          v-tooltip='t("common.remove")'
          class='align-self-center p-1'
          icon='close'
          rounded
          text
          @click='emits("reset-reply-message")'/>
      </div>

      <Textarea
        id='inputMessage'
        v-model='content'
        autofocus
        class='input-chat outline-none shadow-none w-full'
        rows='2'
        style='font-family: Segoe UI Emoji,emoji'
        @blur='focusInputMessage'
        @keydown.alt='handleAltHotkeys'
        @keydown.enter.prevent='sendMessage'/>
    </div>

    <div class='align-items-center flex flex-row gap-2 ml-2'>
      <div class='align-items-center flex flex-column gap-2'>
        <div
          v-tooltip='t("chat.conversation.emoji")'
          class='cursor-pointer text-center text-xl'
          @click='openEmoji'>😀
        </div>
        <AppIcon
          v-tooltip='t("chat.conversation.attachment")'
          class='cursor-pointer'
          name='attachment'
          size='1.5'
          @click='upload'/>
      </div>
      <ButtonIcon
        class='p-button-icon-only'
        icon='send'
        rounded
        @click='sendMessage'/>
    </div>
  </div>
  <OverlayPanel ref='emoji'>
    <ChatEmoji @insert-emoji='insertEmoji'/>
  </OverlayPanel>
</template>

<script setup lang='ts'>
import { isEmpty, trim } from 'lodash';
import { storeToRefs } from 'pinia';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatEmoji from '@/apps/chat/components/ChatEmoji.vue';
import ReplyMessage from '@/apps/chat/components/history/messages/ReplyMessage.vue';
import type { ChatMessage } from '@/apps/chat/model/chat';
import { useChatStore } from '@/apps/chat/store/chat';
import AppIcon from '@/common/components/app/AppIcon.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  replyMessage: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});

const emits = defineEmits(['reset-reply-message']);

const {
  loadingHistory,
  conversation
} = storeToRefs(useChatStore());
const content = ref<string>('');

const { t } = useI18n();
const emoji = ref();

function insertEmoji(s: string) {
  content.value = content.value + s;
}

function handleAltHotkeys(e: KeyboardEvent) {
  if (e.key === '.') {
    openEmoji(e);
  }
}

function sendMessage(event: KeyboardEvent) {
  if (loadingHistory.value) {
    return;
  }

  if (event.shiftKey && event.code === 'Enter' && content.value) {
    content.value += '\n';
  } else {
    const message = trim(content.value);
    if (!isEmpty(message)) {
      EventBus.emit('send-message', {
        conversationId: conversation.value?.id,
        content: message,
        replyMessageId: props.replyMessage?.id
      });
    }
    content.value = '';
  }
}

function upload() {
  if (!loadingHistory.value) {
    EventBus.emit('chat-upload');
  }
}

function focusInputMessage() {
  // const inputMessage = document.getElementById('inputMessage');
  // if (inputMessage) {
  //   inputMessage.focus();
  // }
}

function openEmoji(event: Event) {
  emoji.value.toggle(event);
}

defineExpose({ focusInputMessage });
</script>

<script lang='ts'>
export default { name: 'ChatInput' };
</script>