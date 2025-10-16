<template>
  <div
    class='bg-green-400 border-green-600 border-left-3 flex flex-column px-2 py-1'>
    <strong :class='{"text-primary": !isHistory}'>{{ item.sender }}</strong>
    <small
      class='font-italic'
      style='font-family: Segoe UI Emoji,emoji'>{{ `"${ generateMessage(item) }"` }}</small>
  </div>
</template>

<script setup lang='ts'>
import { type PropType } from 'vue';

import type { ChatMessage } from '@/apps/chat/model/chat';

defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  },
  isHistory: {
    type: Boolean,
    default: false
  }
});

function generateMessage(message: ChatMessage) {
  const {
    content,
    attachments
  } = message || {};

  if (attachments?.length) {
    return `${ attachments[0].name }${ attachments.length > 1 ? ' ...' : '' }`;
  } else {
    return content;
  }
}

</script>

<script lang='ts'>
export default { name: 'ReplyMessage' };
</script>