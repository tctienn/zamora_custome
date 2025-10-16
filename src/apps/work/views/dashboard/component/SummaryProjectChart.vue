<template>
  <div class='flex flex-column h-full items-center justify-center'>
    <p class='font-bold text-xl'>Tổng hợp công việc trong dự án</p>
    <div class='my-auto'>
      <div class='chart-container'>
        <Chart
          :data='chartData'
          :options='chartOptions'
          type='doughnut'/>
      </div>
      <div class='summary'>
        <p>Công việc thực hiện: {{data.totalFemale + data.totalMale}}/200</p>
        <span>Đã hoàn thành: <strong>{{ data.totalMale }}</strong></span>
        <span>Đang thực hiện: <strong>{{ data.totalFemale }}</strong></span>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { ChartData, ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref } from 'vue';

import { dashboardGenderEmployees } from '@/apps/hrm/api/graphql/employee';
import type { DashboardGenderEmployee } from '@/apps/hrm/model/employee';

const data = ref({} as DashboardGenderEmployee);
dashboardGenderEmployees(null).onResult((res) => {
  data.value = res.data.dashboardGenderEmployees;
});
// Dữ liệu mẫu
const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Nam', 'Nữ'],
  datasets: [
    {
      data: [data.value.totalMale, data.value.totalFemale],
      backgroundColor: ['#42A5F5', '#FF9F40D6'],
      hoverBackgroundColor: ['#64B5F6', '#F48FB1'],
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
</style>
