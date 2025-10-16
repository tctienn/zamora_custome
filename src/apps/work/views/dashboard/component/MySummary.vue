<template>
  <div class='flex flex-column gap-2 pb-5 w-full'>
    <!--    block dau tien-->
    <div class='align-items-center justify-content-between summary-block w-full'>
      <div class='border border-1 border-300 border-round-sm p-3 project-summary surface-0'>
        <p class='font-bold text-xl'>1. Tổng hợp dự án</p>
        <SummaryItem :data-summary='summaryProject'/>
      </div>
      <div class='border border-1 border-300 border-round-sm p-3 surface-0 task-summary'>
        <p class='font-bold text-xl'>2. Tổng hợp công việc</p>
        <SummaryItem :data-summary='summaryProject'/>
      </div>
    </div>
    <!--    block thu 2-->
    <div class='align-items-stretch detail-project-block w-full'>
      <div class='border border-1 border-300 border-round-sm flex-1 p-3 project-detail surface-0'>
        <ProjectList/>
      </div>
      <div class='border border-1 border-300 border-round-sm flex-1 p-3 project-detail surface-0'>
        <SummaryProjectChart />
      </div>
      <div class='border border-1 border-300 border-round-sm flex-1 p-3 project-detail surface-0'>
        <SummaryProjectChart />
      </div>
    </div>
    <div class='align-items-stretch detail-task-block w-full'>
      <div class='border border-1 border-300 border-round-sm flex-1 p-3 surface-0 task-detail'>
        <SummaryProjectChart />
      </div>
      <div class='border border-1 border-300 border-round-sm flex-1 p-3 surface-0 task-detail'>
        <TaskList />
      </div>
      <div class='border border-1 border-300 border-round-sm flex-1 p-3 surface-0 task-detail'>
        <SummaryProjectChart />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import ProjectList from '@/apps/work/views/dashboard/component/ProjectList.vue';
import SummaryItem from '@/apps/work/views/dashboard/component/SummaryItem.vue';
import SummaryProjectChart from '@/apps/work/views/dashboard/component/SummaryProjectChart.vue';
import TaskList from '@/apps/work/views/dashboard/component/TaskList.vue';

const summaryProject = [
  {
    id: 1,
    title: 'Tổng số dự án',
    value: '10',
    icon: 'pi pi-folder-open',
    color: {
      bgColor: '#FEF3D7',
      textColor: '#36A2EB',
    }
  },

  {
    id: 2,
    title: 'Dự án đã hoàn thành',
    value: '3',
    icon: 'pi pi-check-square',
    color: {
      bgColor: '#D1FAE5',
      textColor: '#15C872D6',
    }
  },
  {
    id: 3,
    title: 'Dự án đang hoạt động',
    value: '5',
    icon: 'pi pi-check-circle',
    color: {
      bgColor: '#C8E5F5',
      textColor: '#36A2EB',
    }
  },
  {
    id: 4,
    title: 'Tổng số việc tham gia',
    value: '2',
    icon: 'pi pi-times-circle',
    color: {
      bgColor: '#CEF7EE',
      textColor: '#36A2EB',
    }
  },
];
</script>

<style lang="scss" scoped>
.summary-block {
  display: grid;
  grid-template-columns: calc(50% - 5px) calc(50% - 5px);
  gap: 10px;
}
.detail-project-block {
  display: grid;
  grid-template-columns: calc(50% - 5px) calc(25% - 10px) calc(25% - 5px);
  gap: 10px;
}
.detail-task-block {
  display: grid;
  grid-template-columns: calc(25% - 10px) calc(50% - 5px) calc(25% - 5px);
  gap: 10px;
}

</style>