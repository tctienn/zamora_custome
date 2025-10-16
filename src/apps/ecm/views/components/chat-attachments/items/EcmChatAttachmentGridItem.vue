<template>
  <div class='col-6 lg:col-3 md:col-4 p-3 xl:col-2'>
    <div
      aria-haspopup='true'
      class='border-round cursor-pointer file-folder-item flex flex-column grid-item p-3 prevent-select row-gap-2 surface-card'
      :class='{ "selected-file-folder": chatSelectedAttachments.includes(attachment)}'
      @contextmenu='toggleMenu($event, attachment)'>
      <div class='flex justify-content-end'>
        <ButtonIcon
          class='p-0'
          icon='more_vert'
          icon-size='1.5'
          severity='secondary'
          text
          @click='toggleMenu($event, attachment)'/>
      </div>

      <img
        :alt='attachment.extension'
        class='block file-extension-icon mx-auto'
        draggable='false'
        :src='getFileIcon(attachment.extension)'
        @error='handleFileImageError'/>

      <div class='align-items-center flex flex-column pt-3 row-gap-2'>
        <router-link
          v-tooltip.bottom='attachment.name'
          class='font-bold overflow-x-hidden text-center text-overflow-ellipsis w-full white-space-nowrap'
          target='_blank'
          :to='{name: "ChatAttachmentViewer", params: {attachmentId: attachment.id}}'>{{ attachment.name }}
        </router-link>
        <span
          class='font-italic'>
          {{ convertFileSize(attachment.size ? attachment.size : 0) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { type PropType } from 'vue';

import type { ChatAttachment } from '@/apps/ecm/model/chat';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';
import EventBus from '@/common/helpers/event-bus';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

defineProps({
  attachment: {
    type: Object as PropType<ChatAttachment>,
    default: {} as ChatAttachment
  }
});

const { chatSelectedAttachments } = storeToRefs(useEcmChatStore());

function toggleMenu(event: Event, attachment: ChatAttachment) {
  chatSelectedAttachments.value = [attachment];

  EventBus.emit('toggle-chat-attachment-menu', event);
}

</script>

<script lang="ts">
export default { name: 'EcmChatAttachmentGridItem' };
</script>