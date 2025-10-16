<template>
  <div class='card'>
    <DataTable
      :always-show-paginator='false'
      :first='first'
      paginator
      :rows='row'
      :value='props.data'>
      <ColumnGroup type='header'>
        <Row>
          <Column
            header='STT'
            :rowspan='2' />
          <Column
            header='Đơn vị'
            :rowspan='2' />
          <Column
            header='Tổng'
            :rowspan='2' />
          <Column
            :colspan='2'
            header='Đã xử lý' />
          <Column
            :colspan='3'
            header='Đang xử lý' />
        </Row>
        <Row>
          <Column
            field='lastYearSale'
            header='Trong hạn' />
          <Column
            field='thisYearSale'
            header='Quá hạn' />
          <Column
            field='lastYearProfit'
            header='Trong hạn' />
          <Column
            field='thisYearProfit'
            header='Sắp đến hạn(3 ngày)' />
          <Column
            field='thisYearSale'
            header='Quá hạn' />
        </Row>
      </ColumnGroup>
      <Column
        class='text-center'
        style='max-width: 5%'>
        <template #body='slotProps'>
          {{ currentPage * row + slotProps.index + 1 }}
        </template>
      </Column>
      <Column field='name' />
      <Column
        class='text-center'
        field='total'>
        <template #body='{ data }'>
          <Chip
            class='bg-purple-200 font-bold'
            :label='data.total.toString()'/>
        </template>
      </Column>
      <Column
        class='text-center'
        field='processedOnTime'>
        <template #body='{ data }'>
          <Chip
            class='bg-blue-200 font-bold'
            :label='data.processedOnTime.toString()'/>
        </template>
      </Column>
      <Column
        class='text-center'
        field='processedLate'>
        <template #body='{ data }'>
          <Chip
            class='bg-red-200 font-bold'
            :label='data.processedLate.toString()'/>
        </template>
      </Column>
      <Column
        class='text-center'
        field='processingOnTime'>
        <template #body='{ data }'>
          <Chip
            class='bg-blue-200 font-bold'
            :label='data.processingOnTime.toString()'/>
        </template>
      </Column>
      <Column
        class='text-center'
        field='processingCloseToDeadline'>
        <template #body='{ data }'>
          <Chip
            class='bg-orange-200 font-bold'
            :label='data.processingCloseToDeadline.toString()'/>
        </template>
      </Column>
      <Column
        class='text-center'
        field='processingLate'>
        <template #body='{ data }'>
          <Chip
            class='bg-red-200 font-bold'
            :label='data.processingLate.toString()'/>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Column from 'primevue/column';
import { type PropType, ref } from 'vue';

import type { DeptReportStatistic } from '@/apps/document/model/statistic';

const props = defineProps({
  data: {
    type: Array as PropType<DeptReportStatistic[]>,
    default: () => [],
  },
});

const currentPage = ref(0);
const first = ref(0);
const row = ref(10);

function onPage(event: any) {
  currentPage.value = event.page;
  first.value = event.first;
}
</script>

<style scoped></style>
