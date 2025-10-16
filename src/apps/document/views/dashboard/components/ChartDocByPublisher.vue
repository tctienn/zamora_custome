<template>
  <div class='chart-container'>
    <Chart
      class='w-full'
      :data='chartData'
      :options='chartOptions'
      type='bar'/>
  </div>
</template>

<script lang="ts" setup>
import type { ChartData } from 'chart.js';
import type { ChartOptions } from 'chart.js/dist/types';
import { computed } from 'vue';

import { useThemeStore } from '@/common/store/theme';

import { calculateStepSize } from './dept/chartUtils';

const props = defineProps<{
  data?: Array<{
    publisherName: string;
    count: number;
  }> | null;
}>();

const { dark } = useThemeStore();

const chartData = computed((): ChartData => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
  
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  // Lấy tối đa 10 đơn vị có số lượng cao nhất
  const topData = [...props.data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    labels: topData.map(item => item.publisherName),
    datasets: [
      {
        label: 'Số lượng văn bản',
        backgroundColor: documentStyle.getPropertyValue('--blue-500'),
        borderColor: documentStyle.getPropertyValue('--blue-500'),
        data: topData.map(item => item.count),
      }
    ]
  };
});

const chartOptions = computed((): ChartOptions => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  // Tính toán step size dựa trên dữ liệu
  let maxCount = 0;
  if (props.data && props.data.length > 0) {
    maxCount = Math.max(...props.data.map(item => item.count));
  }
  
  // Đảm bảo luôn có giá trị max tối thiểu là 10
  maxCount = Math.max(maxCount, 10);
  
  // Xác định step size phù hợp
  const stepSize = calculateStepSize(maxCount);

  return {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: surfaceBorder }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: maxCount,
        ticks: {
          color: textColor,
          stepSize: stepSize
        },
        grid: { color: surfaceBorder }
      }
    }
  };
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 25rem;
  width: 100%;
  overflow: hidden;
}

:deep(.p-chart) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* Đảm bảo canvas không vượt ra khỏi container */
:deep(canvas) {
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