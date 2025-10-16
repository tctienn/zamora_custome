<template>
  <div class='align-items-center flex gap-1 justify-content-end'>
    <div class='bg-blue-400 note'></div>
    <span>{{ t("document.dashboard.processed") }}</span>
    <div class='bg-orange-400 ml-3 note'></div>
    <span>{{ t("document.dashboard.processing") }}</span>
  </div>
  <div class='flex-nowrap grid hover-to-show-scroll-x mt-1'>
    <div
      v-for='(chartData, index) in chartsData'
      :key='index'
      class='align-items-center col-3 flex flex-column gap-2'>
      <ChartDoughnut
        :processed='chartData.processed'
        :processing='chartData.processing'/>
      <span> {{ chartData.position }} </span>
      <span class='font-bold'> {{ chartData.name }} </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DeptReportStatistic } from '@/apps/document/model/statistic';
import ChartDoughnut from '@/apps/document/views/dashboard/components/dept/ChartDoughnut.vue';

const props = defineProps({
  data: {
    type: Array as PropType<DeptReportStatistic[]>,
    default: () => [],
  },
});
const { t } = useI18n();
const chartsData = computed(() => {
  return props.data?.map((item: DeptReportStatistic) => ({
    name: item.name,
    position: item.position,
    processed: item.processed,
    processing: item.processing,
  }));
});
</script>

<style scoped>
.note {
  width: 2rem;
  height: 1rem;
}

.hover-to-show-scroll-x {
  overflow: hidden !important;
}

.hover-to-show-scroll-x:hover {
  overflow-x: auto !important;
}
</style>
