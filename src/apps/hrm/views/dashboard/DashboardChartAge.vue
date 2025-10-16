<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
                font-weight: bold;
                color: #1A4F9C;
                text-align: center;'>
      Thống kê nhân sự theo độ tuổi
    </div>
    <div
      v-if='hasData'
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

<script lang='ts' setup>
import type { ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref, watch } from 'vue';

import { dashboardAgeEmployees } from '@/apps/hrm/api/graphql/employee';
import type { DashboardAgeEmployee } from '@/apps/hrm/model/employee';

const props = defineProps<{
  organizationId?: string | null;
}>();

const data = ref({} as DashboardAgeEmployee);

let currentApiCall: ReturnType<typeof dashboardAgeEmployees> | null = null;

// Function to fetch data based on organizationId
const fetchAgeEmployeesData = (orgId: string | null) => {
  if (orgId) {
    currentApiCall = dashboardAgeEmployees(orgId);
    currentApiCall.onResult((res) => {
      data.value = res.data?.dashboardAgeEmployees ? res.data.dashboardAgeEmployees : {};
    });
  } else {
    // Clear the data if no organizationId is provided
    data.value = {
      count18To24Male: 0,
      count25To29Male: 0,
      count30To39Male: 0,
      count40To49Male: 0,
      count50Male: 0,
      count18To24Female: 0,
      count25To29Female: 0,
      count30To39Female: 0,
      count40To49Female: 0,
      count50Female: 0
    } as DashboardAgeEmployee;
  }
};

// Initialize data if organizationId is provided
if (props.organizationId) {
  fetchAgeEmployeesData(props.organizationId);
}

const hasData = computed(() => {
  // Check if any of the age group counts are greater than 0
  return (
    data.value.count18To24Male > 0 || data.value.count25To29Male > 0
      || data.value.count30To39Male > 0 || data.value.count40To49Male > 0
      || data.value.count50Male > 0
      || data.value.count18To24Female > 0 || data.value.count25To29Female > 0
      || data.value.count30To39Female > 0 || data.value.count40To49Female > 0
      || data.value.count50Female > 0
  );
});

const chartData = computed(() => (
  {
    labels: ['18-24', '25-29', '30-39', '40-49', '50 trở lên'],
    datasets: [
      {
        label: 'Nam',
        backgroundColor: '#42A5F5',
        data: [data.value.count18To24Male, data.value.count25To29Male, data.value.count30To39Male, data.value.count40To49Male, data.value.count50Male]
      },
      {
        label: 'Nữ',
        backgroundColor: '#EC407A',
        data: [data.value.count18To24Female, data.value.count25To29Female, data.value.count30To39Female, data.value.count40To49Female, data.value.count50Female]
      }
    ]
  }
));

const chartOptions = ref<ChartOptions<'bar'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
});

// Watch for changes in organizationId and refetch data
watch(() => props.organizationId, (newOrgId: string | null | undefined) => {
  // Cancel the previous subscription if exists
  if (currentApiCall) {
    currentApiCall.stop();
  }
  fetchAgeEmployeesData(newOrgId ?? null);
}, { immediate: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  margin: auto;
}

:deep(canvas) {
  height: 100%;
}

:deep(.p-chart) {
  height: 270px !important;
}
</style>