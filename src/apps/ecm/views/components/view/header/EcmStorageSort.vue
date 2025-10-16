<template>
  <Dropdown
    v-model='sortOption'
    class='filter-selection'
    option-label='label'
    option-value='value'
    :options='sortingOptions'
    :placeholder='t("common.order")'
    scroll-height='300px'
    show-clear>
  </Dropdown>
</template>

<script setup lang="ts">
import { map, upperFirst } from 'lodash';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { PERSON_SORTING_STORAGE_OPTIONS, SORTING_STORAGE_OPTIONS } from '@/apps/ecm/constants';
import { useStorageStore } from '@/apps/ecm/store/storage';

const { t } = useI18n();
const { sortOption, serviceType } = storeToRefs(useStorageStore());

const sortingOptions = map([ServiceType.PERSON, ServiceType.PERSON_RECENT].includes(serviceType.value)
  ? [...SORTING_STORAGE_OPTIONS, ...PERSON_SORTING_STORAGE_OPTIONS] : SORTING_STORAGE_OPTIONS, (option) => ({
  value: option,
  label: t(`ecm.storage.sortingOptions.${option.column + upperFirst(option.direction)}`)
}));

</script>

<script lang="ts">
export default { name: 'EcmStorageSort' };
</script>