<template>
  <div class='border-round card p-2'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Công việc tham gia</div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <div class='space-y-6'>
      <div class='flex gap-1'>
        <div class='bg-red-100  p-3  rounded  shadow  text-center  w-10rem'>
          <div
            class='font-semibold text-sm'
            style='color: black'>Tất cả
          </div>
          <div class='font-bold text-red-600 text-xl'>{{ mapCountCodeAll.ALL }}</div>
        </div>
        <div class='bg-orange-100  p-3  rounded  shadow  text-center  w-10rem'>
          <div
            class='font-semibold text-black-alpha-50 text-sm'>Tôi thực hiện
          </div>
          <div class='font-bold text-orange-500 text-xl'>{{ mapCountCodeAll.IMPLEMENT }}</div>
        </div>
        <div class='bg-blue-100  p-3  rounded  shadow  text-center  w-10rem'>
          <div
            class='font-semibold text-black-alpha-50 text-sm'>Tôi đã giao
          </div>
          <div class='font-bold text-blue-500 text-xl'>{{ mapCountCodeAll.ASSIGN }}</div>
        </div>
        <div class='bg-green-100  p-3  rounded  shadow  text-center  w-10rem'>
          <div
            class='font-semibold text-black-alpha-50 text-sm'>Tôi theo dõi
          </div>
          <div class='font-bold text-green-500 text-xl'>{{ mapCountCodeAll.FOLLOW }}</div>
        </div>
      </div>

      <Chart
        class='w-full'
        :data='chartData'
        :options='chartOptions'
        type='bar'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { ChartData, ChartOptions } from 'chart.js';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';

import { countTasksRole, searchTasks } from '@/apps/work/api/graphql/task-api';
import { type SearchTaskInput, type Task, TaskRoleFilter } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const {
  statuses,
  mapStatusesCount,
  tasks
} = storeToRefs(useTaskStore());
const chartData = ref<ChartData<'bar' | 'line'>>();
const chartOptions = ref<ChartOptions<'bar' | 'line'>>();
const statusStart = computed(() => statuses.value.find(s => s.type == 'START')?.id ?? '');
const statusInProgress = computed(() => statuses.value.find(s => s.type == 'IN_PROGRESS')?.id ?? '');
const statusCompleted = computed(() => statuses.value.find(s => s.type == 'COMPLETED')?.id ?? '');
const statusInCanceled = computed(() => statuses.value.find(s => s.type == 'CANCELED')?.id ?? '');
const statusInStopped = computed(() => statuses.value.find(s => s.type == 'STOPPED')?.id ?? '');

function setChart() {
  chartData.value = {
    labels: ['Bắt đầu', 'Đang làm', 'Đã huỷ', 'Hoàn thành', 'Tạm ngừng'],
    datasets: [
      {
        type: 'bar',
        backgroundColor: '#42A5F5',
        data: [mapStatusesCount.value[statusStart.value],
          mapStatusesCount.value[statusInProgress.value],
          mapStatusesCount.value[statusInCanceled.value],
          mapStatusesCount.value[statusCompleted.value],
          mapStatusesCount.value[statusInStopped.value]],
        borderRadius: 10
      },
    ]
  };

  chartOptions.value = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        stacked: false,
        ticks: { color: '#495057' },
        grid: { color: '#ebedef' }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: { color: '#495057' },
        grid: { color: '#ebedef' }
      }
    }
  };
}

function animateCount(refVar: any, target: number, duration = 1000) {
  const start = performance.now();

  const update = (timestamp: number) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    refVar.value = Math.floor(progress * target);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      refVar.value = target;
    }
  };

  requestAnimationFrame(update);
}

const { user } = storeToRefs(useUserStore());

const searchInput = ref<SearchTaskInput>({
  userId: user.value.id || '',
  isAdminSearch: true,
  isFilterEvaluate: false,
  isFilterDeadlineExtension: false,
} as SearchTaskInput);

const countWorksQuery = countTasksRole(searchInput.value);
const mapCountCodeAll = reactive<Record<TaskRoleFilter | 'waitingEvaluate' | 'deadlineExtension', number>>({
  ALL: 0,
  ASSIGN: 0,
  FOLLOW: 0,
  IMPLEMENT: 0,
  MY_DEPT: 0,
  waitingEvaluate: 0,
  deadlineExtension: 0,
});

const { onResult: countOnResult, } = countWorksQuery;
countOnResult(param => {
  const data = param.data?.countTasksRole;
  mapCountCodeAll.ALL = data?.all;
  mapCountCodeAll.IMPLEMENT = data?.implement;
  mapCountCodeAll.ASSIGN = data?.assign;
  mapCountCodeAll.FOLLOW = data?.follow;
  mapCountCodeAll.MY_DEPT = data?.myDept;
  mapCountCodeAll.waitingEvaluate = data?.waitingEvaluate;
  mapCountCodeAll.deadlineExtension = data?.deadlineExtension;

  animateCount(mapCountCodeAll.ALL, mapCountCodeAll.ALL);
  animateCount(mapCountCodeAll.IMPLEMENT, mapCountCodeAll.IMPLEMENT);
  animateCount(mapCountCodeAll.ASSIGN, mapCountCodeAll.ASSIGN);
  animateCount(mapCountCodeAll.FOLLOW, mapCountCodeAll.FOLLOW);

  setChart();
});

const pageable: Pageable = {
  page: 0,
  size: 9999999,
  sort: [
    {
      property: 'last_modified_time',
      direction: Direction.DESC,
    },
    {
      property: 'order_no',
      direction: Direction.ASC,
    },

  ],
};

const {
  load: listDataLoad,
  onResult: listDataOnResult,
} = searchTasks(searchInput.value, pageable);
listDataOnResult(res => {
  tasks.value = res.data?.searchTasks?.edges?.map((e: Edge<Task>) => {
    return {
      ...e.node,
      remainTime: e.node?.dueTime ? Date.now() - new Date(e.node?.dueTime).valueOf() : -Infinity
    };
  }) || [];
});
listDataLoad();
</script>

<style scoped>
</style>
