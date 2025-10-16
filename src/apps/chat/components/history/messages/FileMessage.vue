<template>
  <div
    v-for='(file, index) in item.attachments'
    :key='index'
    class='cursor-pointer flex flex-row'
    @click='downloadAttachment(file)'>
    <template v-if='file'>
      <img
        :alt='file.name'
        class='mr-3 w-2rem'
        :src='getFileIcon(getFileExtension(file.name))'/>
      <div class='flex flex-column justify-content-center'>
        <span class='font-bold white-space-pre-wrap'>
          {{ trim(file.name) }}
        </span>
        <small
          class='font-italic mt-1'>
          {{ convertFileSize(file.size ? file.size : getBase64FileSize(file.data)) }}
        </small>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { trim } from 'lodash';
import { type PropType } from 'vue';

import type { ChatMessage } from '@/apps/chat/model/chat';
import {
  convertFileSize,
  downloadFileUrl,
  generateChatAttachmentDownloadUrl,
  getBase64FileSize,
  getFileExtension,
  getFileIcon
} from '@/common/helpers/file-utils';
import type { Attachment } from '@/common/model';

defineProps({
  item: {
    type: Object as PropType<ChatMessage>,
    default: {} as ChatMessage
  }
});

function downloadAttachment(file: Attachment) {
  const fileUrl = generateChatAttachmentDownloadUrl(file.path);
  if(fileUrl) {
    downloadFileUrl(fileUrl, file.name);
  }
}
</script>

<script lang="ts">
export default { name: 'FileMessage' };
</script>

<style scoped>

</style>