<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      padding-bottom: 2rem;
      text-align: center;'>
      Đánh giá nhân viên
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
            <Badge
              class='h-1rem m-0 w-1rem'
              :severity='item.severity'/>
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
import { computed, ref } from 'vue';

import { getJobEvaluationListGraphql } from '../../api/graphql/mission';
import type { NoteInterface } from '../../model/mission/mission';

const data = ref<NoteInterface[]>([]);
const totalNote = ref<number>(0);
const gradeCounts = computed(() => {
  const counts: Record<string, number> = {};

  (data.value || []).forEach((item) => {
    const grade = item.grade;
    
    counts[grade] = (counts[grade] || 0) + 1;
  });
  return counts;
});
const {
  onResult: onNoteResult,
  load: loadNote,
} = getJobEvaluationListGraphql();

onNoteResult((res) => {
  data.value = res.data.getJobEvaluationList.content;
  totalNote.value = res.data.getJobEvaluationList.totalRecords;
});

loadNote(undefined, {
  jobEvaluationSearchInput: {},
  pageable: {
    page: 0,
    size: 9999 
  }
});

const chartData = computed<ChartData<'pie'>>(() => {
  const values = Object.values(gradeCounts.value);
  return {
    datasets: [
      {
        data: values,
        backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B'],
        hoverBackgroundColor: ['#4ADE80', '#60A5FA', '#FBBF24']
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
    label: 'Xếp loại B',
    severity: 'success',
    value: gradeCounts.value['B'] || 0
  },
  {
    label: 'Xếp loại C',
    severity: 'info',
    value: gradeCounts.value['C'] || 0
  },
  {
    label: 'Xếp loại D',
    severity: 'warning',
    value: gradeCounts.value['D'] || 0
  }
]);
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
