<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      padding-bottom: 2rem;
      text-align: center;'>
      Thống kê nhân sự theo giới tính
    </div>
    <div>
      <div class='chart-container'>
        <Chart
          :data='chartData'
          :options='chartOptions'
          type='doughnut'/>
      </div>
      <div class='summary'>
        <span>Nam : <strong>{{ data.totalMale }}</strong></span>
        <span>Nữ : <strong>{{ data.totalFemale }}</strong></span>
        <span>Khác : <strong>0</strong></span>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { ChartData, ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref, watch } from 'vue';

import { dashboardGenderEmployees } from '@/apps/hrm/api/graphql/employee';
import type { DashboardGenderEmployee } from '@/apps/hrm/model/employee';

const props = defineProps<{
  organizationId?: string | null;
}>();

const data = ref({} as DashboardGenderEmployee);

let currentApiCall: ReturnType<typeof dashboardGenderEmployees> | null = null;

// Function to fetch data based on organizationId
const fetchGenderEmployeesData = (orgId: string | null) => {
  if (orgId) {
    currentApiCall = dashboardGenderEmployees(orgId);
    currentApiCall.onResult((res) => {
      data.value = res.data?.dashboardGenderEmployees ? res.data.dashboardGenderEmployees : {};
    });
  } else {
    // Clear the data if no organizationId is provided
    data.value = {
      totalMale: 0,
      totalFemale: 0,
      total: 0
    } as DashboardGenderEmployee;
  }
};

// Initialize data if organizationId is provided
if (props.organizationId) {
  fetchGenderEmployeesData(props.organizationId);
}

// Dữ liệu mẫu
const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Nam', 'Nữ', 'Khác'],
  datasets: [
    {
      data: [data.value.totalMale, data.value.totalFemale, 0],
      backgroundColor: ['#42A5F5', '#EC407A', '#F48FB1'],
      hoverBackgroundColor: ['#64B5F6', '#F48FB1', '#F48FB1'],
      borderWidth: 2
    }
  ]
}));

const chartOptions = ref<ChartOptions<'doughnut'>>({
  cutout: '60%',
  plugins: { legend: { display: false } },
  responsive: true,
  maintainAspectRatio: false
});

// Watch for changes in organizationId and refetch data
watch(() => props.organizationId, (newOrgId: string | null | undefined) => {
  // Cancel the previous subscription if exists
  if (currentApiCall) {
    currentApiCall.stop();
  }
  fetchGenderEmployeesData(newOrgId ?? null);
}, { immediate: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 350px;
  margin: auto;
  padding: 1rem 0;
}

.summary {
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
}

.summary span {
  margin: 0 1rem;
  font-weight: 500;
}

.summary strong {
  font-weight: 700;
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
  max-width: 600px;
  margin: auto;
}

:deep(.p-card-content) {
  padding: 0
}

:deep(.chart-container) {
  padding: 0
}
:deep(.p-chart) {
  height: 200px !important;
}
</style>
