
<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      text-align: center;'>
      Khối lượng công việc theo phòng ban
    </div>
    <div>
      <Chart
        :data='chartData'
        :options='chartOptions'
        type='bar'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { ChartData, ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import { getJobCountByDepartment } from '../../api/graphql/job-api';
import { type CountJobByEachDepartmentResult, RoleType } from '../../model/job/job';
const props = defineProps({
  rolesUser: {
    type: Array as PropType<string[]>,
    default: () => []
  },
});
const data = ref<CountJobByEachDepartmentResult[]>([]);

getJobCountByDepartment().onResult((res) => {
  data.value = res.data.getJobCountByDepartment;
});
const chartData = computed<ChartData<'bar'>>(() => {
  const labels = (data.value || []).map((d) => d.departmentName);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Tạo mới',
        backgroundColor: '#3B82F6',
        data: data.value.map((d) => d.jobStatusCount.new)
      },
      {
        label: 'Đang thực hiện',
        backgroundColor: '#213C7A',
        data: data.value.map((d) => d.jobStatusCount.inProgress)
      },
      {
        label: 'Chờ phê duyệt',
        backgroundColor: '#F59E0B',
        data: data.value.map((d) => {
          return props.rolesUser.includes(RoleType.LANH_DAO) ? d.jobStatusCount.totalReportJobGeneralLeaderApproved : d.jobStatusCount.totalReportJobToLeader;
        })
      },
      {
        label: 'Chờ tiếp nhận',
        backgroundColor: '#888888',
        data: data.value.map((d) => d.jobStatusCount.waitingForAccept)
      },
      {
        label: 'Hoàn thành',
        backgroundColor: '#22C55E',
        data: data.value.map((d) => d.jobStatusCount.completed)
      },
    ]
  };
});

const chartOptions = ref<ChartOptions<'bar'>>({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: {
      beginAtZero: true,
      stacked: true,
      max: 100
    }
  }
});
</script>

<style scoped>
:deep(canvas) {
  height: 100%;
}

:deep(.p-chart) {
  height: 230px
}
</style>