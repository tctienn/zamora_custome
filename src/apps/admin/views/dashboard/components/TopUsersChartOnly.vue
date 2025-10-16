<template>
  <div class='chart-container'>
    <Chart
      class='w-full'
      :data='chartData'
      :options='chartOptions'
      type='bar' />
  </div>
</template>

<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Mock data for top users access
const topUsersData = ref([
  {
    name: 'Nguyễn Văn A',
    accessCount: 1245
  },
  {
    name: 'Trần Thị B',
    accessCount: 987
  },
  {
    name: 'Lê Văn C',
    accessCount: 876
  },
  {
    name: 'Phạm Thị D',
    accessCount: 765
  },
  {
    name: 'Hoàng Văn E',
    accessCount: 654
  }
]);

// Chart data computed from top users data
const chartData = computed<ChartData<'bar'>>(() => {
  const labels = topUsersData.value.map(user => user.name);
  const accessCounts = topUsersData.value.map(user => user.accessCount);
  
  // Get document style for consistent colors
  const documentStyle = getComputedStyle(document.documentElement);
  
  return {
    labels,
    datasets: [
      {
        label: t('admin.dashboard.dashboard.accessCount'),
        data: accessCounts,
        backgroundColor: documentStyle.getPropertyValue('--blue-500'),
        borderColor: documentStyle.getPropertyValue('--blue-500'),
        borderWidth: 1
      }
    ]
  };
});

// Chart options - identical to Overview chart
const chartOptions = ref<ChartOptions<'bar'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: 1500,
    },
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
      },
    },
  },
});

onMounted(() => {
  try {
    // In a real implementation, you would fetch data from an API here
    console.log('TopUsersChartOnly mounted');
  } catch (error) {
    console.error('Error initializing TopUsersChartOnly:', error);
  }
});
</script>

<style scoped>
/* Chart container adjustments - identical to Overview chart */
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

/* Responsive height adjustments - identical to Overview chart */
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