<template>
  <div class='column-gap-2 flex flex-row left-message'>
    <ChatAvatar
      v-if='showAvatar'
      :item='item'/>

    <div
      v-else
      class='w-3rem'></div>

    <CMessage
      class='bg-yellow-300 text-green-800'
      :class='{"opacity-70": item.isDeleted}'
      :item='item'/>
  </div>

</template>

<script lang='ts' setup>
import { type PropType } from 'vue';

import ChatAvatar from '@/apps/chat/components/ChatAvatar.vue';
import CMessage from '@/apps/chat/components/history/CMessage.vue';
import type { ChatMessage } from '@/apps/chat/model/chat';

defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
});

</script>

<script lang='ts'>
export default { name: 'LeftMessage' };
</script>

<style scoped>

</style>