<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      padding-bottom: 2rem;
      text-align: center;'>
      Thống kê hoạt động
    </div>
    <div>
      <div class='chart-container'>
        <Chart
          :data='chartData'
          :options='chartOptions'
          :plugins='[centerTextPlugin]'
          type='pie'/>
      </div>
      <div class='px-5 summary'>
        <div
          v-for='item in statusList'
          :key='item.label'
          class='align-items-center flex gap-5 justify-content-between'>
          <div class='align-items-center flex gap-2 w-12rem'>
            <Badge
              class='h-1rem m-0 w-1rem'
              :style='{ backgroundColor: item.severity }'/>
            <span>{{ item.label }}</span>
          </div>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { Chart, ChartData, ChartOptions } from 'chart.js';
import { computed, ref } from 'vue';

import { getCountAllActivityStatus } from '../../api/graphql/activity-api';

const data = ref({
  totalAll: 0,
  new: 0,
  inProgress: 0,
  completed: 0,
  waitingForGeneralLeaderApproveActivity: 0,
  generalLeaderRejectedActivity: 0,
  waitingForApprovalExtensionDeadlineRequest: 0
});
getCountAllActivityStatus().onResult((res) => {
  data.value = res.data.getCountAllActivityStatus;
});

const chartData = computed<ChartData<'pie'>>(() => ({
  datasets: [
    {
      // eslint-disable-next-line max-len
      data: [data.value.new, data.value.inProgress, data.value.waitingForGeneralLeaderApproveActivity, data.value.generalLeaderRejectedActivity, data.value?.waitingForApprovalExtensionDeadlineRequest, data.value.completed],
      backgroundColor: ['#3B82F6', '#213C7A', '#F59E0B', '#EF4444', '#FCD34D', '#22C55E'],
      hoverBackgroundColor: ['#60A5FA', '#3F5CB2', '#FBBF24', '#EA4234', '#FCD34D', '#4ADE80']
    }
  ]
}));

const chartOptions = ref<ChartOptions<'pie'>>({
  cutout: '40%',
  plugins: { legend: { display: false } },
  responsive: true,
  maintainAspectRatio: false
});

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart: Chart<'doughnut'>) {
    const { width, height, ctx } = chart;
    ctx.restore();
    const text = String(data.value.totalAll);

    ctx.font = 'bold 20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';

    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;
    ctx.fillText(text, textX, textY);

    ctx.save();
  }
};

const statusList = computed(() => [
  {
    label: 'Tạo mới',
    severity: '#3B82F6',
    value: data.value.new 
  },
  {
    label: 'Đang thực hiện',
    severity: '#213C7A',
    value: data.value.inProgress
  },
  {
    label: 'Chờ gia hạn',
    severity: '#FCD34D',
    value: data.value?.waitingForApprovalExtensionDeadlineRequest
  },
  {
    label: 'Hoàn thành',
    severity: '#22C55E',
    value: data.value.completed
  },
  {
    label: 'Chờ chấp thuận',
    severity: '#F59E0B',
    value: data.value.waitingForGeneralLeaderApproveActivity 
  },
  {
    label: 'Không chấp thuận',
    severity: '#EF4444',
    value: data.value.generalLeaderRejectedActivity 
  }
]);
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 280px;
  margin: auto;
  padding: 1rem 0;
}

.summary {
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary span {
  font-weight: 500;
}

:deep(.chart-container) {
  padding: 0
}
</style>
