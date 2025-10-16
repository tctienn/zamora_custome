<template>
  <WorkManager
    ref='workManagerRef'
    v-model:search-date='searchDate'
    v-model:view-type='viewType'
    is-admin-search>
    <template #header='{reload}'>
      <TaskManagerHeader
        v-model:search-date='searchDate'
        v-model:view-type='viewType'
        v-model:visible-form='visibleForm'
        :header="'Quản lý công việc'">
        <template #addButton>
          <div></div>
        </template>
        <template #reloadButton='{loading}'>
          <ButtonIcon
            class='focus:shadow-none font-normal hover:surface-200'
            icon='refresh'
            :label='t("common.refresh")'
            :loading='loading'
            outlined
            @click='reload'>
          </ButtonIcon>
        </template>
        <template #exportButton>
          <div></div>
        </template>
        <template #selectedButton>
          <div></div>
        </template>
      </TaskManagerHeader>
    </template>
  </WorkManager>
</template>

<script lang='ts' setup>
import type Button from 'primevue/button';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import WorkManager from '@/apps/work/views/task/manager/TaskManager.vue';
import TaskManagerHeader from '@/apps/work/views/task/manager/TaskManagerHeader.vue';
import type { ViewType } from '@/apps/work/views/task/manager/type';

const viewType = defineModel<ViewType>('viewType', { default: 'list' });
const searchDate = defineModel<Date>('searchDate', { default: new Date() });
const visibleForm = ref<boolean>(false);
const { t } = useI18n();
</script>

<style scoped>
</style>

<script lang='ts'>
</script>