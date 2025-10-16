<template>
  <div>
    <Dropdown
      v-model='chatAttachmentSortOption'
      class='filter-selection'
      option-label='label'
      option-value='value'
      :options='sortingOptions'
      :placeholder='t("common.order")'
      scroll-height='300px'
      show-clear
      @change='sortAttachment'/>
  </div>
</template>

<script setup lang="ts">
import { map, orderBy, toLower, upperFirst } from 'lodash';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import type { ChatAttachment } from '@/apps/ecm/model/chat';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';

const { t } = useI18n();

const SORTING_OPTIONS = [
  {
    column: 'name',
    direction: 'asc'
  },
  {
    column: 'name',
    direction: 'desc'
  },
  {
    column: 'sentAt',
    direction: 'asc'
  },
  {
    column: 'sentAt',
    direction: 'desc'
  },
];

const { chatAttachments, chatAttachmentSortOption } = storeToRefs(useEcmChatStore());

const sortingOptions = map(SORTING_OPTIONS, (option) => ({
  value: option,
  label: t(`ecm.chatAttachment.sortingOptions.${option.column + upperFirst(option.direction)}`)
}));

function sortAttachment() {
  const sortColumn = (option: ChatAttachment) => {
    if (chatAttachmentSortOption.value?.column === 'name') {
      return toLower(option.name);
    }
    if (chatAttachmentSortOption.value?.column === 'sentAt') {
      return option.sentAt;
    }
    return chatAttachmentSortOption.value?.column;
  };
  chatAttachments.value = orderBy(chatAttachments.value, [sortColumn], [chatAttachmentSortOption.value?.direction ?? 'asc']) as ChatAttachment[];
}

</script>

<script lang="ts">
export default { name: 'EcmChatAttachmentsSort' };
</script>