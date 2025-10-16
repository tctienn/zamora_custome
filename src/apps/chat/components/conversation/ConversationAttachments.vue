<template>
  <div class='flex flex-column p-2 row-gap-2'>
    <div
      v-for='attachment in attachments'
      :key='attachment.id'
      class='column-gap-2 cursor-pointer flex flex-row'
      @click='downloadAttachment(attachment)'>
      <img
        :alt='attachment.name'
        class='w-2rem'
        :src='getFileIcon(getFileExtension(attachment.name))'/>
      <div class='flex flex-column row-gap-1'>
        <span>
          {{ attachment.name }}
        </span>
        <small>
          {{ convertFileSize(attachment.size) }} &bull; {{ attachment.sender }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { getConversationAttachments } from '@/apps/chat/api/rest/conversation-api';
import { useChatStore } from '@/apps/chat/store/chat';
import type { ChatAttachment } from '@/apps/ecm/model/chat';
import {
  convertFileSize,
  downloadFileUrl,
  generateChatAttachmentDownloadUrl,
  getFileExtension,
  getFileIcon
} from '@/common/helpers/file-utils';
import type { Attachment } from '@/common/model';

const chatStore = useChatStore();
const { conversation } = storeToRefs(chatStore);

const attachments = ref<ChatAttachment[]>([]);

onMounted(() => {
  getConversationAttachments(conversation.value.id).then((response) => {
    if (typeof response === 'object') {
      attachments.value = response;
    }
  });
});

function downloadAttachment(attachment: Attachment) {
  const fileUrl = generateChatAttachmentDownloadUrl(attachment.path);
  if(fileUrl) {
    downloadFileUrl(fileUrl, attachment.name);
  }
}
</script>

<script lang='ts'>
export default { name: 'ConversationAttachments' };
</script>