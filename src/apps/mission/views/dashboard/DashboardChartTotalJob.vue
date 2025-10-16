<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      padding-bottom: 2rem;
      text-align: center;'>
      Tổng công việc
    </div>
    <div>
      <div class='chart-container'>
        <Chart
          :data='chartData'
          :options='chartOptions'
          :plugins='[centerTextPlugin]'
          type='pie'/>
      </div>
      <div class='px-5 summary'>
        <div
          v-for='item in statusList'
          :key='item.label'
          class='align-items-center flex gap-5 justify-content-between'>
          <div class='align-items-center flex gap-2 w-12rem'>
            <AppIcon
              :class="flagColors[item.severity] ?? 'text-gray-400'"
              fill
              name='flag'
              size='1.5'/>
            <span>{{ item.label }}</span>
          </div>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { Chart, ChartData, ChartOptions } from 'chart.js';
import moment from 'moment';
import { computed, ref, watch } from 'vue';

import { getJobEvaluationListGraphql } from '../../api/graphql/mission';
import type { SearchNoteInput } from '../../model/mission/mission';

const data = ref({
  totalYellowFlag: 1,
  totalRedFlag: 0,
  totalGreenFlag: 0,
});
const totalNote = computed(() => (data.value?.totalGreenFlag ?? 0) + (data.value?.totalYellowFlag ?? 0) + (data.value?.totalRedFlag ?? 0));

const {
  onResult: onNoteResult,
  load: loadNote,
} = getJobEvaluationListGraphql();

onNoteResult((res) => {
  data.value = res.data.getJobEvaluationList.content[0]?.flagSummary;
});

const yearModel = defineModel<Date | null>('yearModel', { default: new Date });
const searchNoteRate = ref<SearchNoteInput>({});
loadNote(undefined, {
  jobEvaluationSearchInput: searchNoteRate.value,
  pageable: {
    page: 0,
    size: 9999 
  }
});

watch(yearModel, (newYear) => {
  console.log(yearModel.value);
  
  if (newYear) {
    searchNoteRate.value.year = moment(newYear).year();
  }
});

const chartData = computed<ChartData<'pie'>>(() => {
  return {
    datasets: [
      {
        data: [data.value?.totalGreenFlag, data.value?.totalYellowFlag, data.value?.totalRedFlag],
        backgroundColor: ['#27AB8A', '#F9C404', '#DB272D'],
        hoverBackgroundColor: ['#4ADE80', '#FBBF24', '#E35156']
      }
    ]
  };
});

const chartOptions = ref<ChartOptions<'pie'>>({
  cutout: '40%',
  plugins: { legend: { display: false } },
  responsive: true,
  maintainAspectRatio: false
});

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart: Chart<'doughnut'>) {
    const { width, height, ctx } = chart;
    ctx.restore();
    const text = String(totalNote.value);

    ctx.font = 'bold 20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';

    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;
    ctx.fillText(text, textX, textY);

    ctx.save();
  }
};

const statusList = computed(() => [
  {
    label: 'Cờ xanh',
    severity: 'GREEN',
    value: data.value?.totalGreenFlag
  },
  {
    label: 'Cờ vàng',
    severity: 'YELLOW',
    value: data.value?.totalYellowFlag
  },
  {
    label: 'Cờ đỏ',
    severity: 'RED',
    value: data.value?.totalRedFlag
  }
]);

const flagColors: Record<string, string> = {
  RED: 'text-red-500',
  YELLOW: 'text-yellow-500',
  GREEN: 'text-green-500'
};

</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 280px;
  margin: auto;
  padding: 1rem 0;
}

.summary {
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary span {
  font-weight: 500;
}

:deep(.chart-container) {
  padding: 0
}
</style>
