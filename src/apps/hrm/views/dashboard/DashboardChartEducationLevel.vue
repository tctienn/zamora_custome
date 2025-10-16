<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      text-align: center;'>
      Thống kê nhân sự theo trình độ học vấn
    </div>
    <div v-if='data.length > 0'>
      <Chart
        :data='chartData'
        :options='chartOptions'
        type='bar'/>
    </div>
    <div 
      v-else 
      class='align-items-center flex justify-content-center'
      style='min-height: 300px;'>
      <div class='p-4 text-center'>
        <i class='mb-3 pi pi-inbox text-4xl text-gray-400'></i>
        <p class='text-gray-600 text-lg'>Không có dữ liệu để hiển thị</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'primevue/chart';
import { computed, onUnmounted, ref, watch } from 'vue';

import { dashboardEduEmployees } from '@/apps/hrm/api/graphql/employee';
import type { DashboardEduEmployee } from '@/apps/hrm/model/employee';

const props = defineProps<{
  organizationId?: string | null;
}>();

const data = ref([] as DashboardEduEmployee[]);

let currentApiCall: ReturnType<typeof dashboardEduEmployees> | null = null;

// Function to fetch data based on organizationId
const fetchEduEmployeesData = (orgId: string | null) => {
  if (orgId) {
    currentApiCall = dashboardEduEmployees(orgId);
    currentApiCall.onResult((res) => {
      data.value = res.data?.dashboardEduEmployees ? res.data.dashboardEduEmployees : [];
    });
  } else {
    // Clear the data if no organizationId is provided
    data.value = [];
  }
};

// Initialize data if organizationId is provided
if (props.organizationId) {
  fetchEduEmployeesData(props.organizationId);
}

// Watch for changes in organizationId and refetch data
watch(() => props.organizationId, (newOrgId: string | null | undefined) => {
  // Cancel the previous subscription if exists
  if (currentApiCall) {
    currentApiCall.stop();
  }
  fetchEduEmployeesData(newOrgId ?? null);
}, { immediate: true });

// Clean up the subscription when component is unmounted
onUnmounted(() => {
  if (currentApiCall) {
    currentApiCall.stop();
  }
});

const sortedData = computed(() => {
  return [...data.value].sort((a, b) => a.orderNumber - b.orderNumber);
});

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: sortedData.value.map((d) => d.levelName),
  datasets: [
    {
      label: 'Nam',
      backgroundColor: '#42A5F5',
      data: data.value.map((d) => d.countMale)
    },
    {
      label: 'Nữ',
      backgroundColor: '#EC407A',
      data: data.value.map((d) => d.countFemale)
    },
  ]
}));

const chartOptions = ref<ChartOptions<'bar'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' }, },
  scales: { y: { beginAtZero: true }, }
});
</script>

<style scoped>

:deep(canvas) {
  height: 100%;
}

:deep(.p-chart) {
  height: 300px !important;
}
</style>