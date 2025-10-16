<template>
  <ReplyMessage
    v-if='item.replyMessage'
    :is-history='true'
    :item='item.replyMessage'/>
  <span
    class='white-space-pre-wrap word-break-break-word'
    style='font-family: Segoe UI Emoji,emoji'>
    {{ trim(item.content) }}
  </span>
</template>

<script setup lang="ts">
import { trim } from 'lodash';
import { type PropType } from 'vue';

import ReplyMessage from '@/apps/chat/components/history/messages/ReplyMessage.vue';
import type { ChatMessage } from '@/apps/chat/model/chat';

defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});
</script>

<script lang="ts">
export default { name: 'TextMessage' };
</script>