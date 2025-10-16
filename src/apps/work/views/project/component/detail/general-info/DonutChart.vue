<template>
  <div class='align-items-center flex justify-content-around mb-5 py-3'>
    <div v-if="selectedChart==='donut'">
      <div
        v-if='dataInvalid'
        class='font-semibold'>
        Số liệu không hợp lệ. Không thể vẽ biểu đồ
      </div>
      <Chart
        v-else
        :data='chartDataSummary'
        :options='chartOptionsDonut'
        :plugins='[ChartDataLabels]'
        type='doughnut'/>
    </div>
    <div
      v-else-if="selectedChart==='bar'"
      id='chartContainer'>
      <Chart
        :data='chartDataSummary'
        :options='chartOptionsBar'
        type='bar'/>
    </div>
    <div>
      <ul class='bullet-style-lv1 flex flex-column gap-4 p-0'>
        <li>
          <span class='text-green-400'> ■ </span>
          <span class='font-semibold'>{{ t('work.work.status.completed.this') }}</span>
          <ul class='bullet-style-lv2 flex flex-column gap-4 pt-4 px-4'>
            <li>
              {{ t('work.work.status.completed.beforeTime') }}: <span
                class='font-semibold'>{{ summaryTaskProject?.completed?.beforeTime }}</span></li>
            <li> {{ t('work.work.status.completed.onTime') }}: <span
              class='font-semibold'>{{ summaryTaskProject?.completed?.onTime }}</span></li>
            <li> {{ t('work.work.status.completed.overTime') }}: <span
              class='font-semibold'>{{ summaryTaskProject?.completed?.overTime }}</span></li>
          </ul>
        </li>
        <li>
          <span class='text-blue-400'> ■ </span>
          <span class='font-semibold'>
            {{ t('work.work.status.onGoing.this') }}
          </span>
          <ul class='bullet-style-lv2 flex flex-column gap-4 pt-4 px-4'>
            <li>{{ t('work.work.status.onGoing.onTime') }}:
              <span class='font-semibold'>{{ summaryTaskProject?.onGoing?.beforeTime }}</span></li>
            <li> {{ t('work.work.status.onGoing.overTime') }}: <span class='font-semibold text-red-400'>{{
              summaryTaskProject?.onGoing?.overTime
            }}</span></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

</template>

<script lang="ts" setup>

import type { ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { MenuItem } from 'primevue/menuitem';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SummaryTaskProject } from '@/apps/work/views/project/component/detail/general-info/type';

const props = defineProps({
  summaryTaskProject: {
    type: Object as PropType<SummaryTaskProject>,
    default: undefined
  }
});

const chartDataSummary = computed(() => {
  const labels = [];
  const data = [];
  if (sumCompleted.value) {
    labels.push(t('work.work.status.completed.this'));
    data.push(sumCompleted.value);
  }

  if (sumOnGoing.value) {
    labels.push(t('work.work.status.onGoing.this'));
    data.push(sumOnGoing.value);
  }
  if (sumOnGoing.value) {
    labels.push('Khác');
    data.push(props.summaryTaskProject?.other || 0);
  }

  return {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: [colorCount('completed').background, colorCount('onGoingOnTime').background, colorCount('other').background],
      }
    ]
  };
});
const chartOptionsDonut: ChartOptions = {
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
    datalabels: {
      color: 'white',
      formatter: function (value: object, context: object) {
        const rs = Number(value) / (sumCompleted.value + sumOnGoing.value + (props.summaryTaskProject?.other || 0)) * 100;
        return Math.round(rs * 100) / 100 + '%';
      },
      font: { size: 20 }
    }
  }
};

const { t } = useI18n();
const overlayChart = ref();
const chartOptionsBar: ChartOptions = {
  plugins: {
    legend: { display: false },
    chartAreaBorder: {
      borderColor: 'red',
      borderWidth: 2,
      borderDash: [5, 5],
      borderDashOffset: 2,
    }
  },
  responsive: true,
};

function changeChartOption(event: Event) {
  overlayChart.value.toggle(event);
}

const selectedChart = ref<'donut' | 'bar'>('donut');
const chartOptions = ref<MenuItem[]>([
  {
    label: t('work.project.chart.pie'),
    active: true,
    command: event => {
      chartOptions.value.forEach(value => {
        value.active = false;
      });
      selectedChart.value = 'donut';
      event.item.active = true;
    },
  },
  {
    label: t('work.project.chart.bar'),
    active: false,
    command: event => {
      chartOptions.value.forEach(value => {
        value.active = false;
      });
      selectedChart.value = 'bar';
      event.item.active = true;
    },
  }
]);

const colorCount = (status: string) => {
  let color = '#22C55E';
  switch (status) {
  case 'onGoingOnTime':
    color = '#2196F3';
    break;
  case 'other':
    color = '#FBAD4C';
    break;
  }
  return { background: color };
};

const sumCompleted = computed(() => {
  return (props.summaryTaskProject?.completed?.beforeTime || 0) + (props.summaryTaskProject?.completed?.onTime || 0) + (props.summaryTaskProject?.completed?.overTime || 0);
});
const sumOnGoing = computed(() => {
  return (props.summaryTaskProject?.onGoing?.beforeTime || 0) + (props.summaryTaskProject?.onGoing?.overTime || 0);
});

const dataInvalid = computed(() => {
  return sumCompleted.value == 0 && sumOnGoing.value == 0;
});
</script>

<style lang="scss" scoped>

.bullet-style-lv2 > li::before {
  content: '•'; /* Different marker symbol */
  font-size: 1.2em;
  margin-right: 8px;
}

/* Remove default markers */
.bullet-style-lv1,
.bullet-style-lv2 {
  list-style: none;
  padding-left: 0;
}
</style>