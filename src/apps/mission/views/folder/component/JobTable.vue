<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    row-hover
    selection-mode='single'
    :value='listJob'>
    <Column
      class='p-1 px-3 text-700 text-center'
      :header='t("mission.mission.No")'
      style='width: 5%'>
      <template #body='{index}'>
        {{ index + 1 }}
      </template>
    </Column>
    <Column
      class='col-2 p-2 text-left'
      field='jobName'
      :header='t("mission.job.jobTableCol.name")'
      header-class='float-left'>
      <template #body='{ data }'>
        <div
          class='cursor-pointer'
          @click='openFormForJobType(data.jobType, data.id, true)'>
          <p
            class='font-medium mb-0'
            :style='{ color: getDeadlineColor(data.processingDeadline) }'>{{ data.jobName }}</p>
          <p
            class='mb-1'
            :style='{ color: getDeadlineColor(data.processingDeadline) }'>{{ data.jobCode }}</p>
        </div>
      </template>
    </Column>
    <Column
      class='col-2 p-2'
      field='activityName'
      :header='t("mission.activity.activityTableCol.name")'
      header-class='float-left'>
    </Column>
    <Column
      class='col-1 p-0 text-700'
      field='processingDeadline'
      :header='t("mission.job.jobTableCol.processingDeadline")'
      header-class='float-left'>
      <template #body='{ data: { processingDeadline } }'>
        <span :style='{ color: getDeadlineColor(processingDeadline) }'>
          {{ formatDate(processingDeadline, 'DD/MM/YYYY') }}
        </span>
      </template>
    </Column>
    <Column
      class='col-1 text-center'
      field='status'
      :header='t("mission.mission.missionTableCol.status")'>
      <template #body='{data: { status }}'>
        <Badge
          class='capitalize font-semibold py-0 status-badge'
          :severity='getStatusSeverity(status)?.color'
          :value='getStatusSeverity(status)?.text'></Badge>
      </template>
    </Column>
    <Column
      class='text-center'
      :header="t('common.action')"
      style='width: 5%'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_horiz'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu({ event: $event, data: data })'/>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>
import Column from 'primevue/column';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { SORT_TYPE } from '@/apps/document/model/file';
import { getDeadlineColor, getStatusSeverity } from '@/apps/mission/helpers/convert';
import type { JobType } from '@/apps/mission/model/job/job';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { formatDate } from '@/common/helpers/utils';
import type { FilesSystemData } from '@/common/model/attachment';

const props = defineProps({
  listJobs: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  currentSort: {
    type: String,
    default: SORT_TYPE.DOC_NUM,
  },
});
const emits = defineEmits(['toggleActionMenu']);
const { t } = useI18n();
const selectedRow = ref<any>();
const openFormForJobType = inject('openFormForJobType') as (jobType?:JobType, id?: string, isDetail?: boolean) => void;

const sortByField = <T extends keyof FilesSystemData>(
  field: T,
  isDate = false,
) => {
  return [...props.listJobs].sort((a, b) => {
    const valueA = isDate ? new Date(a[field] || 0).getTime() : a[field] || '';
    const valueB = isDate ? new Date(b[field] || 0).getTime() : b[field] || '';
    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
  });
};

const listJob = computed(() => {
  switch (props.currentSort) {
  case SORT_TYPE.DOC_QUOTE:
    return sortByField('quote');
  default:
    return props.listJobs;
  }
});

function toggleActionMenu({
  event,
  data
}: { event: Event; data: any }) {
  emits('toggleActionMenu', [event, data]);
}
</script>

<style scoped>
:deep(.float-left .p-column-header-content) {
  align-items: flex-start !important;
  justify-content: flex-start !important;
}
</style>
