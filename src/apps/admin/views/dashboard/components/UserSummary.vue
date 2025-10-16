<template>
  <div class='border-round border-round-sm card p-2 shadow-none'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Thiết kế truy cập hệ thống</div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <div class='flex flex-column gap-3'>
      <div class='space-y-4'>
        <div class='flex flex-column gap-6 items-center pt-5'>
          <div
            class='flex w-full'>
            <div class='flex gap-4 justify-content-center w-full'>
              <div
                v-for='(item, index) in legendItems'
                :key='index'
                class='align-items-start flex items-center'>
                <div class='flex flex-column gap-2 items-center justify-content-center text-center'>
                  <div
                    class='h-1rem mx-auto w-1rem'
                    :style='{ backgroundColor: item.color }'></div>
                  <div>{{ item.label }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class='chart-container'>
            <Chart
              :data='deviceChartData'
              :options='deviceChartOptions'
              type='doughnut'/>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Device access statistics data
const deviceChartData = ref<ChartData<'doughnut'>>();
const deviceChartOptions = ref<ChartOptions<'doughnut'>>();

// Legend items for device access chart
const legendItems = [
  {
    label: t('admin.dashboard.dashboard.desktop'),
    color: '#3B82F6'
  },
  {
    label: t('admin.dashboard.dashboard.mobile'),
    color: '#10B981'
  },
  {
    label: t('admin.dashboard.dashboard.tablet'),
    color: '#8B5CF6'
  },
  {
    label: t('admin.dashboard.dashboard.other'),
    color: '#F59E0B'
  }
];

// Set chart options
const setChartOptions = (): ChartOptions<'doughnut'> => {
  return {
    cutout: '40%',
    plugins: { 
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round(value / total * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
};

// Set chart data
const setChartData = (): ChartData<'doughnut'> => {
  return {
    labels: legendItems.map(item => item.label),
    datasets: [
      {
        data: [450, 350, 150, 95],
        backgroundColor: legendItems.map(item => item.color),
        hoverBackgroundColor: legendItems.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      }
    ]
  };
};

onMounted(() => {
  try {
    // Initialize chart options and data
    deviceChartOptions.value = setChartOptions();
    deviceChartData.value = setChartData();
  } catch (error) {
    console.error('Error initializing device access chart:', error);
  }
});
</script>

<style scoped>
</style>