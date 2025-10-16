<template>
  <div class='column-gap-2 inline-flex'>
    <Dropdown
      v-model='sharedFilter'
      class='filter-selection'
      option-label='label'
      option-value='value'
      :options='filterShareOptions'
      :placeholder='t("ecm.storage.fileType")'
      show-clear/>
    <Dropdown
      v-model='fileTypeFilter'
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

    <Dropdown
      v-model='lastModifiedFilter'
      class='filter-selection'
      option-label='label'
      option-value='value'
      :options='filterLastModifiedOptions'
      :placeholder='t("ecm.storage.lastModifiedAt")'
      show-clear>
    </Dropdown>

  </div>
</template>

<script setup lang="ts">
import { camelCase, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { FILTER_SHARE, FILTER_STORAGE_FILE_TYPES, FILTER_STORAGE_LAST_MODIFIED } from '@/apps/ecm/constants';
import { useStorageStore } from '@/apps/ecm/store/storage';

const { t } = useI18n();
const { fileTypeFilter, lastModifiedFilter, selectedFileFolders, sharedFilter } = storeToRefs(useStorageStore());
const filterFileTypeOptions = map(FILTER_STORAGE_FILE_TYPES, (option) => ({
  value: option,
  icon: `/images/file-types/${option}.svg`,
  label: t(`ecm.storage.filterFileTypes.${camelCase(option)}`)
}));

const filterLastModifiedOptions = map(FILTER_STORAGE_LAST_MODIFIED, (option) => ({
  value: option.value,
  label: t(`ecm.storage.filterLastModified.${option.label}`)
}));

const filterShareOptions = map(FILTER_SHARE, (option) => ({
  value: option,
  label: t(`ecm.storage.filterShare.${option}`)
}));

watch(() => [fileTypeFilter, lastModifiedFilter, sharedFilter], () => {
  selectedFileFolders.value = [];
}, { deep: true });
</script>

<script lang="ts">

export default { name: 'EcmStorageFilter', };
</script>

<style scoped lang="scss">
</style>