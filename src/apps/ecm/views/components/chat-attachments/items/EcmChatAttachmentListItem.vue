<template>
  <div
    aria-haspopup='true'
    class='col-12 file-folder-item list-item prevent-select'
    :class='{"selected-file-folder": chatSelectedAttachments.includes(attachment)}'
    @contextmenu='toggleMenu($event, attachment)'>
    <div class='align-items-center flex p-1'>
      <div
        class='align-items-center file-folder-info flex'
        style='width: calc(100% - 5rem)'>
        <div class='align-items-center col-6 flex flex-row'>
          <img
            :alt='attachment.extension'
            class='file-extension-icon'
            draggable='false'
            :src='getFileIcon(attachment.extension)'
            @error='handleFileImageError'/>
          <span class='file-folder-name font-bold line-number-1 ml-3'>
            <router-link
              v-tooltip.bottom='attachment.name'
              class='font-bold overflow-x-hidden text-center text-overflow-ellipsis w-full white-space-nowrap'
              target='_blank'
              :to='{name: "ChatAttachmentViewer", params: {attachmentId: attachment.id}}'>{{attachment.name}}</router-link>
          </span>
        </div>
        <div class='col-2 text-center'>{{ attachment.sender }}</div>
        <div class='col-2 text-center'>{{ convertReadableDate(attachment.sentAt) }}</div>
        <div class='col-2 text-center'>{{ convertFileSize(attachment.size) }}</div>
      </div>

      <div class='text-center w-5rem'>
        <ButtonIcon
          class='p-0'
          icon='more_vert'
          icon-size='1.5'
          severity='secondary'
          text
          @click='toggleMenu($event, attachment)'/>
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
import { convertReadableDate } from '@/common/helpers/utils';

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
export default { name: 'EcmChatAttachmentListItem' };
</script>