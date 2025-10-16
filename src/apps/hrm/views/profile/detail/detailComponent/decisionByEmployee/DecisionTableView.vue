<!-- Component: DecisionTableView.vue -->
<template>
  <DataTable
    class='full-height-table mr-2'
    data-key='id'
    :loading='loading'
    :row-class='getRowClass'
    row-hover
    scroll-height='calc(100vh - 12.5rem)'
    scrollable
    show-gridlines
    sort-field='decisionDate'
    :sort-order='-1'
    :value='decisions'>

    <template #empty>
      <ProgressBar
        v-if='loading'
        class='border-noround'
        mode='indeterminate'
        style='height: .25rem' />
      <EmptyResult v-else />
    </template>

    <Column
      header='STT'
      header-class='w-1rem'>
      <template #body='{ index }'>
        <div class='flex justify-content-center'>{{ index + 1 }}</div>
      </template>
    </Column>

    <Column
      body-class=' pl-2'
      field='noDecision'
      header='Số quyết định'
      header-class='text-left'
      style='max-width: 3rem' />

    <Column
      field='decisionDate'
      header='Ngày quyết định'
      :sortable='true'
      style='max-width: 4rem'>
      <template #body='{ data: { decisionDate } }'>
        <div class='flex justify-content-center'>
          {{ formatDate(decisionDate, 'DD/MM/YYYY') }}
        </div>
      </template>
    </Column>

    <Column
      header='Loại quyết định'
      style='max-width: 4rem'>
      <template #body='{ data: { decisionType } }'>
        <div class='flex justify-content-center'>
          {{ getDecisionTypes(decisionType) }}
        </div>
      </template>
    </Column>

    <Column
      header='Cấp ra QD'
      style='max-width: 4rem'>
      <template #body='{ data: { decisionMakingLevelName } }'>
        <div class='flex justify-content-center'>
          {{ decisionMakingLevelName }}
        </div>
      </template>
    </Column>

    <Column
      header='Người ký'
      style='max-width: 4rem'>
      <template #body='{ data: { signerName } }'>
        <div class='flex justify-content-center'>
          {{ signerName }}
        </div>
      </template>
    </Column>

    <Column
      field='effectStartDate'
      header='Ngày hiệu lực'
      sortable
      style='max-width: 4rem'>
      <template #body='{ data: { effectStartDate } }'>
        <div class='flex justify-content-center'>
          {{ formatDate(effectStartDate, 'DD/MM/YYYY') }}
        </div>
      </template>
    </Column>

    <Column
      field='effectEndDate'
      header='Ngày hết hạn'
      sortable
      style='max-width: 4rem'>
      <template #body='{ data: { effectEndDate } }'>
        <div class='flex justify-content-center'>
          {{ formatDate(effectEndDate, 'DD/MM/YYYY') }}
        </div>
      </template>
    </Column>

    <Column
      align-frozen='right'
      body-class='surface-card p-2 text-center'
      frozen
      style='max-width: 1rem'>
      <template #body='{ data }'>
        <DecisionGridItemActions
          :decision='data'
          @view-detail="emit('view-detail', data)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ProgressBar from 'primevue/progressbar';

import type { DecisionInterface } from '@/apps/hrm/model/decision';
import DecisionGridItemActions
  from '@/apps/hrm/views/profile/detail/detailComponent/decisionByEmployee/DecisionGridItemActions.vue';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps<{
  decisions: DecisionInterface[];
  loading: boolean;
  getRowClass: (row: any) => string;
  getDecisionTypes: (type: string) => string | undefined;
  getLeaderName: (id: string) => string;
}>();
const emit = defineEmits(['view-detail']);
</script>

<style scoped>
:deep(.text-left .p-column-header-content) {
  justify-content: flex-start !important;
}
</style>