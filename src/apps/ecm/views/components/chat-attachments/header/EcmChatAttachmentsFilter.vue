<template>
  <div>
    <Dropdown
      v-model='chatAttachmentFileTypeFilter'
      class='filter-selection'
      :options='filterFileTypeOptions'
      :placeholder='t("ecm.storage.fileType")'
      show-clear>
      <template #value='slotProps'>
        <div
          v-if='slotProps.value'
          class='align-items-center flex'>
          <img
            :alt='slotProps.value.label'
            class='h-1rem mr-2'
            :src='slotProps.value.icon'/>
          <div>{{ slotProps.value.label }}</div>
        </div>
        <span v-else>
          {{ slotProps.placeholder }}
        </span>
      </template>
      <template #option='slotProps'>
        <div class='align-items-center flex'>
          <img
            :alt='slotProps.option.label'
            class='h-1rem mr-2'
            :src='slotProps.option.icon'/>
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Dropdown>
  </div>

</template>

<script setup lang="ts">
import { camelCase, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { FILTER_STORAGE_FILE_TYPES } from '@/apps/ecm/constants';
import { useEcmChatStore } from '@/apps/ecm/store/chat-attachments';

const { t } = useI18n();

const { chatAttachmentFileTypeFilter } = storeToRefs(useEcmChatStore());

const filterFileTypeOptions = map(FILTER_STORAGE_FILE_TYPES, (option) => ({
  value: option,
  icon: `/images/file-types/${option}.svg`,
  label: t(`ecm.storage.filterFileTypes.${camelCase(option)}`)
}));
</script>

<script lang="ts">
export default { name: 'EcmChatAttachmentsFilter' };
</script>