<template>
  <component
    :is='chatAttachmentLayout === "list" ? "EcmChatAttachmentListItem" :"EcmChatAttachmentGridItem"'
    :attachment='attachment'/>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { type PropType } from 'vue';

import type { ChatAttachment } from '@/apps/ecm/model/chat';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';

defineProps({
  attachment: {
    type: Object as PropType<ChatAttachment>,
    default: {} as ChatAttachment
  }
});

let { chatAttachmentLayout } = storeToRefs(useEcmChatStore());
</script>

<script lang="ts">
import EcmChatAttachmentGridItem
  from '@/apps/ecm/views/components/chat-attachments/items/EcmChatAttachmentGridItem.vue';
import EcmChatAttachmentListItem
  from '@/apps/ecm/views/components/chat-attachments/items/EcmChatAttachmentListItem.vue';

export default {
  name: 'EcmChatAttachmentItem',

  components: {
    EcmChatAttachmentListItem,
    EcmChatAttachmentGridItem

  }
};
</script>