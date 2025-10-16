<template>
  <component
    :is='viewerType'
    :conversation='conversation' />
</template>

<script setup lang='ts'>
import { computed, type PropType } from 'vue';

import type { ChatConversation } from '@/common/model';

const props = defineProps({
  conversation: {
    type: Object as PropType<ChatConversation>,
    default: {} as ChatConversation
  },
  layout: {
    type: String as PropType<'list' | 'grid'>,
    default: 'list'
  }
});

const viewerType = computed(() => props.layout === 'list' ? 'EcmChatConversationListItem' : 'EcmChatConversationGridItem');

</script>

<script lang='ts'>
import EcmChatConversationGridItem from '@/apps/ecm/views/components/chat-attachments/items/EcmChatConversationGridItem.vue';
import EcmChatConversationListItem from '@/apps/ecm/views/components/chat-attachments/items/EcmChatConversationListItem.vue';
export default {
  name: 'EcmChatConversationItem',

  components: {
    EcmChatConversationGridItem,
    EcmChatConversationListItem
  } 
};
</script>