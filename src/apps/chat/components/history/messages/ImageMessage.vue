<template>
  <div class='column-gap-1 flex flex-row flex-wrap'>
    <Image
      v-for='(image, index) in item.attachments'
      :key='index'
      :alt='image.name'
      class='align-items-center flex justify-content-center max-w-10rem p-1'
      :class='{"border-1 border-round": item.attachments && item.attachments.length > 1}'
      image-class='max-w-9rem'
      preview
      :src='generateChatAttachmentDownloadUrl(image.path)'>
    </Image>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

import type { ChatMessage } from '@/apps/chat/model/chat';
import { generateChatAttachmentDownloadUrl } from '@/common/helpers/file-utils';

defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});
</script>

<script lang="ts">
export default { name: 'ImageMessage' };
</script>