<template>
  <div class='border-round-sm card h-full shadow-none'>
    <div class='border-bottom-1 font-bold p-3 surface-border'>
      {{ t('admin.dashboard.dashboard.topUsersAccess') }}
    </div>
    <div class='p-3'>
      <div class='flex flex-column gap-3'>
        <div
          v-for='(user, index) in topUsersData'
          :key='index'
          class='align-items-center flex justify-content-between p-2 surface-100'>
          <div class='align-items-center flex'>
            <div
              class='align-items-center flex justify-content-center mr-3' 
              style='width: 2.5rem; height: 2.5rem; border-radius: 50%; background-color: #E5E7EB;'>
              <span class='font-bold'>{{ user.initials }}</span>
            </div>
            <div>
              <div class='font-medium'>{{ user.name }}</div>
              <div class='text-500 text-sm'>{{ user.department }}</div>
            </div>
          </div>
          <div class='font-bold'>{{ user.accessCount }}</div>
        </div>
      </div>
      
      <div class='mt-4'>
        <Chart
          :data='chartData'
          :options='chartOptions'
          type='bar' />
      </div>
    </div>
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
    initials: 'NA',
    name: 'Nguyễn Văn A',
    department: 'Phòng Nhân sự',
    accessCount: 1245
  },
  {
    initials: 'TB',
    name: 'Trần Thị B',
    department: 'Phòng Kế toán',
    accessCount: 987
  },
  {
    initials: 'LC',
    name: 'Lê Văn C',
    department: 'Phòng Kỹ thuật',
    accessCount: 876
  },
  {
    initials: 'PD',
    name: 'Phạm Thị D',
    department: 'Phòng Marketing',
    accessCount: 765
  },
  {
    initials: 'HV',
    name: 'Hoàng Văn E',
    department: 'Phòng Kinh doanh',
    accessCount: 654
  }
]);

// Chart data computed from top users data
const chartData = computed<ChartData<'bar'>>(() => {
  const labels = topUsersData.value.map(user => user.name);
  const accessCounts = topUsersData.value.map(user => user.accessCount);
  
  return {
    labels,
    datasets: [
      {
        label: t('admin.dashboard.dashboard.accessCount'),
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        borderWidth: 1,
        data: accessCounts
      }
    ]
  };
});

// Chart options
const chartOptions = ref<ChartOptions<'bar'>>({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.dataset.label || '';
          const value = context.raw || 0;
          return `${label}: ${value}`;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        color: '#6B7280',
        font: { size: 12 }
      },
      grid: { color: '#E5E7EB' }
    },
    y: {
      ticks: {
        color: '#6B7280',
        font: { size: 12 },
        autoSkip: false
      },
      grid: { color: '#E5E7EB' }
    }
  }
});

onMounted(() => {
  try {
    // In a real implementation, you would fetch data from an API here
    console.log('TopUsersChart mounted');
  } catch (error) {
    console.error('Error initializing TopUsersChart:', error);
  }
});
</script>

<style scoped>
.card {
  background-color: var(--surface-card);
  height: 100%;
}

/* Chart container adjustments */
:deep(.p-chart) {
  height: 300px;
}
</style>