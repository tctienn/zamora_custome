<template>
  <div class='flex flex-column'>
    <ReplyMessage
      v-if='item.replyMessage'
      :is-history='true'
      :item='item.replyMessage'/>
    <span
      class='white-space-pre-wrap'>
      <template
        v-for='(split, index) in splitMessage'
        :key='index'>
        <a
          v-if='split.isLink'
          class='underline'
          :class='item.fromUserId === user.id ? "text-yellow-500": "text-primary"'
          :href='split.href'
          target='_blank'>{{ split.text }}</a>
        <template v-else>{{ split.text }}</template>
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref } from 'vue';

import ReplyMessage from '@/apps/chat/components/history/messages/ReplyMessage.vue';
import type { ChatMessage } from '@/apps/chat/model/chat';
import { convertLinkContent } from '@/common/helpers/utils';
import type { SplitLinkContent } from '@/common/model';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});

const { user } = useUserStore();

const splitMessage = ref<SplitLinkContent[]>([]);

onMounted(() => {
  if (props.item) {
    const { content } = props.item;
    splitMessage.value = convertLinkContent(content);
  }
});

</script>

<script lang="ts">
export default { name: 'LinkMessage' };
</script>