<template>
  <div class='flex flex-row'>
    <div class='flex-grow-1 right-message'/>
    <CMessage
      class='text-white'
      :class='{"opacity-70": item.isDeleted}'
      :item='item'/>
  </div>

</template>

<script lang='ts' setup>
import { type PropType } from 'vue';

import CMessage from '@/apps/chat/components/history/CMessage.vue';
import type { ChatMessage } from '@/apps/chat/model/chat';

defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});

</script>

<script lang='ts'>
export default { name: 'RightMessage' };
</script>

<style scoped>

</style>