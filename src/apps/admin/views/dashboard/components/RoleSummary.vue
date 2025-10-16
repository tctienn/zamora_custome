<template>
  <div class='border-round-sm card p-2 shadow-none'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      Tổng hợp truy cập theo đơn vị/phòng ban trong ngày
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <div class='p-3'>
      <div class='grid'>
        <div class='col-12 mt-4'>
          <div class='chart-container'>
            <Chart
              :data='departmentChartData'
              :options='departmentChartOptions'
              type='bar'/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js';
import { cloneDeep } from 'lodash';
import Chart from 'primevue/chart';
import { computed, ref, watch } from 'vue';

import { getSummaryCountLogByOrgId } from '@/apps/admin/api/graphql/log-auth-graphql-api';

const props = defineProps({
  selectedOrganization: {
    type: String,
    default: undefined
  }
});

const departmentData = ref([]);

const {
  onResult,
  refetch
} = getSummaryCountLogByOrgId(props.selectedOrganization);

watch(() => props.selectedOrganization, () => {
  refetch({ organizationId: props.selectedOrganization });
});

onResult(res => {
  departmentData.value = cloneDeep(res.data.getSummaryCountLogByOrgId);
});

// Chart data computed from department data
const departmentChartData = computed<ChartData<'bar'>>(() => {
  const labels = departmentData.value.map((d: any) => d.name);
  const accessCounts = departmentData.value.map((d: any) => d.count);
  const colors = labels.map(() => getRandomColor());

  return {
    labels,
    datasets: [
      {
        backgroundColor: colors,
        data: accessCounts
      }
    ]
  };
});

// Generate random colors for chart bars
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  return '#' + Array.from({ length: 6 })
    .map(() => letters[Math.floor(Math.random() * 16)])
    .join('');
};

// Chart options
const departmentChartOptions = ref<ChartOptions<'bar'>>({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || '';
          const value = context.raw || 0;
          return `${label}: ${value} lượt truy cập`;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { color: '#1F2937' },
      grid: { color: '#E5E7EB' }
    },
    y: {
      ticks: {
        autoSkip: false,
        color: '#1F2937',
        font: { size: 14 },
      },
      grid: { color: '#E5E7EB' }
    }
  }
});

</script>

<style scoped>
.card {
  background-color: var(--surface-card);
}

/* Chart container adjustments */
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