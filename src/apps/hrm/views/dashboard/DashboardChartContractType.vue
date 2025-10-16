<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      padding-bottom: 2rem;
      text-align: center;'>
      Thống kê nhân sự theo loại hợp đồng
    </div>

    <div
      v-if='data.length > 0'
      class='chart-container'>
      <Chart
        :data='chartData'
        :options='chartOptions'
        type='bar'/>
    </div>
    <div 
      v-else 
      class='align-items-center chart-container flex justify-content-center'
      style='min-height: 300px;'>
      <div class='p-4 text-center'>
        <i class='mb-3 pi pi-inbox text-4xl text-gray-400'></i>
        <p class='text-gray-600 text-lg'>Không có dữ liệu để hiển thị</p>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref, watch } from 'vue';

import { dashboardContractEmployees } from '@/apps/hrm/api/graphql/employee';
import type { DashboardContractEmployee } from '@/apps/hrm/model/employee';

const props = defineProps<{
  organizationId?: string | null;
}>();

const data = ref([] as DashboardContractEmployee[]);

let currentApiCall: ReturnType<typeof dashboardContractEmployees> | null = null;

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  return '#' + Array.from({ length: 6 })
    .map(() => letters[Math.floor(Math.random() * 16)])
    .join('');
};

// Function to fetch data based on organizationId
const fetchContractEmployeesData = (orgId: string | null) => {
  if (orgId) {
    currentApiCall = dashboardContractEmployees(orgId);
    currentApiCall.onResult((res) => {
      data.value = res.data?.dashboardContractEmployees || [];
    });
  } else {
    // Clear the data if no organizationId is provided
    data.value = [];
  }
};

// Initialize data if organizationId is provided
if (props.organizationId) {
  fetchContractEmployeesData(props.organizationId);
}

const chartData = computed<ChartData<'bar'>>(() => {
  const labels = data.value.map((d) => d.contractType);
  const totals = data.value.map((d) => d.total);
  const colors = labels.map(() => getRandomColor());

  return {
    labels,
    datasets: [
      {
        backgroundColor: colors,
        data: totals
      }
    ]
  };
});

const chartOptions = ref<ChartOptions<'bar'>>({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { stepSize: 50 }
    },
    y: { ticks: { autoSkip: false } }
  }
});

// Watch for changes in organizationId and refetch data
watch(() => props.organizationId, (newOrgId: string | null | undefined) => {
  // Cancel the previous subscription if exists
  if (currentApiCall) {
    currentApiCall.stop();
  }
  fetchContractEmployeesData(newOrgId ?? null);
}, { immediate: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  margin: auto;
}

:deep(.p-card-title) {
  font-size: 18px;
  font-weight: bold;
  color: #1A4F9C;
  text-align: center;
}

.p-card {
  border-radius: 0;
  width: 100%;
  max-width: 900px;
  margin: auto;
}
:deep(.p-chart) {
  height: 400px !important;
}
</style>
