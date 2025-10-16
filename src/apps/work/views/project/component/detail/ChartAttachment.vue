<template>
  <div>
    <div class='border-bottom-1 flex'>
      <div
        class='align-content-center flex h-3rem justify-content-between surface-0 w-full'>
        <div class='align-content-center flex pl-2'>
          <div class='align-content-center'>
            <AppIcon
              class='text-600'
              name='database'
              size='1.8'/>
          </div>
          <div class='align-content-center font-semibold text-600'>{{ t('work.project.totalCapacity') }} {{
            convertFileSize(chartInfo.capacity ?? 0)
          }}
          </div>
        </div>
        <div class='align-content-center'>
          <ButtonIcon
            class='text-600'
            icon='more_vert'
            icon-size='1.8'
            rounded
            text
            @click='toggleChartMenu({event : $event})'/>
        </div>
      </div>
    </div>
    <div class='chart-container'>
      <Chart
        class='w-full'
        :data='chartData'
        :options='chartOptions'
        :type='typeChart'>
      </Chart>
    </div>
    <Menu
      ref='menuChartAction'
      :model='menuChart'
      :popup='true'>
      <!--      <template #item='{item: {icon, label}}'>-->
      <!--        <MenuItem-->
      <!--          :icon='icon'-->
      <!--          :label='label'/>-->
      <!--      </template>-->

      <template #item='itemProp'>
        <div class='cursor-pointer flex gap-1 p-2'>
          <AppIcon
            class='mr-2'
            name='check'
            size='1.5'
            :style='{opacity:typeChart==itemProp.item.key?1:0,
                     color: typeChart == itemProp.item.key ? "#0d99ff" : ""}'/>

          <div
            :style='{color: typeChart == itemProp.item.key ? "#0d99ff" : ""}'>
            {{ itemProp.item.label }}
          </div>
        </div>
      </template>
    </Menu>
  </div>
</template>

<script setup lang='ts'>
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { PropertyType } from '@/apps/admin/model/object/Property';
import type { ChartInfo } from '@/apps/work/model/workAttachment';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { convertFileSize } from '@/common/helpers/file-utils';

const props = defineProps({
  chartInfo: {
    type: Object as PropType<ChartInfo>,
    default: {} as ChartInfo
  },
  chartData: {
    type: Object,
    default: null
  }
});
const emits = defineEmits(['refetch-data', 'type-chart']);
const { t } = useI18n();
const menuChartAction = ref();
const chartOptions = ref();
const typeChart = ref<'pie' | 'bar'>('pie');

onMounted(() => {
  chartOptions.value = setChartOptions();
});

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');

  return {
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: textColor
        }
      }
    }
  };
};

const menuChartCondition = [
  {
    label: t('work.project.chartPie'),
    icon: 'pie_chart',
    key: 'pie',
    command: () => changeTypeChart('pie')
  },
  {
    label: t('work.project.chartBar'),
    icon: 'leaderboard',
    key: 'bar',
    command: () => changeTypeChart('bar')
  }
];

const menuChart = menuChartCondition;

function toggleChartMenu({ event }: { event: Event }) {
  menuChartAction.value.toggle(event);
}

function changeTypeChart(type: 'pie' | 'bar') {
  typeChart.value = type;
  emits('type-chart', type);
  emits('refetch-data');
}
</script>

<script lang='ts'>
export default { name: 'ChartAttachment' };
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 25rem;
  width: 100%;
  overflow: hidden;
}

.chart-container :deep(.p-chart) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.chart-container :deep(canvas) {
  max-width: 100%;
  max-height: 100%;
}

/* Responsive height adjustments */
@media screen and (max-width: 768px) {
  .chart-container {
    height: 20rem;
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .chart-container {
    height: 22rem;
  }
}

@media screen and (min-width: 1025px) {
  .chart-container {
    height: 25rem;
  }
}
</style>