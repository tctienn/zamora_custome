<template>
  <div class='border-round card p-2'>
    <div class='flex font-bold justify-content-between text-primary text-xl'>
      <div>Dự án tham gia</div>
    </div>
    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>
    <div class='flex flex-column gap-3'>
      <div class='space-y-4'>
        <div class='flex gap-1'>
          <div class='bg-red-100  p-3  rounded  shadow  text-center  w-10rem'>
            <div
              class='font-semibold text-sm'
              style='color: black'>Tất cả
            </div>
            <div class='font-bold text-red-600 text-xl'>{{ totalFilter }}</div>
          </div>
          <div class='bg-orange-100  p-3  rounded  shadow  text-center  w-10rem'>
            <div
              class='font-semibold text-black-alpha-50 text-sm'>Tôi thực hiện
            </div>
            <div class='font-bold text-orange-500 text-xl'>{{ totalImplement }}</div>
          </div>
          <div class='bg-blue-100  p-3  rounded  shadow  text-center  w-10rem'>
            <div
              class='font-semibold text-black-alpha-50 text-sm'>Tôi đã giao
            </div>
            <div class='font-bold text-blue-500 text-xl'>{{ totalAdmin }}</div>
          </div>
          <div class='bg-green-100  p-3  rounded  shadow  text-center  w-10rem'>
            <div
              class='font-semibold text-black-alpha-50 text-sm'>Tôi theo dõi
            </div>
            <div class='font-bold text-green-500 text-xl'>{{ totalFollow }}</div>
          </div>
        </div>

        <div class='flex flex-col gap-6 items-center pt-5'>
          <Chart
            :data='chartData'
            :options='chartOptions'
            type='doughnut'/>

          <div
            class='flex pt-6 w-full'>
            <div class='flex flex-column gap-4 w-full'>
              <div
                v-for='(item, index) in legendItems'
                :key='index'
                class='flex items-center'>
                <div class='flex gap-2'>
                  <div
                    class='h-1rem  w-1rem'
                    :style='{ backgroundColor: item.color }'></div>
                  <div>{{ item.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>

import type { ChartData, ChartOptions } from 'chart.js';
import { onMounted, ref } from 'vue';

import { getProjectGraphql } from '@/apps/work/api/graphql/project';
import { FilterType, StatusProject } from '@/apps/work/views/project/model';

const chartData = ref<ChartData<'doughnut'>>();
const chartOptions = ref<ChartOptions<'doughnut'>>();

const legendItems = [
  {
    label: 'Đã hoàn thành',
    color: '#8BC34A'
  },
  {
    label: 'Đang thực hiện',
    color: '#03A9F4'
  },
  {
    label: 'Đang xây dựng',
    color: '#E91E63'
  },
  {
    label: 'Chuẩn bị triển khai',
    color: '#FF9800'
  },
  {
    label: 'Tạm dừng',
    color: '#9E9E9E'
  },
  {
    label: 'Hủy bỏ',
    color: '#F44336'
  },
];

const setChartOptions = (): ChartOptions<'doughnut'> => {
  return {
    cutout: '40%',
    plugins: { legend: { display: false } }
  };
};

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

const {
  onResult,
  load,
} = getProjectGraphql('', StatusProject.ALL, FilterType.ALL, {});

const data = ref();
const totalFilter = ref();
const totalAdmin = ref();
const totalImplement = ref();
const totalFollow = ref();
const totalOrganization = ref();
const totalUnderConstruction = ref();
const totalPrepareForDeployment = ref();
const totalProcessing = ref();
const totalCompleted = ref();
const totalPause = ref();
const totalCancel = ref();
const totalClose = ref();

onResult((res) => {
  data.value = res.data.getProjects.projects;
  totalFilter.value = res.data.getProjects.totalFilter;
  totalAdmin.value = res.data.getProjects.totalAdmin;
  totalImplement.value = res.data.getProjects.totalImplement;
  totalFollow.value = res.data.getProjects.totalFollow;
  totalOrganization.value = res.data.getProjects.totalOrganization;
  totalUnderConstruction.value = res.data.getProjects.totalUnderConstruction;
  totalPrepareForDeployment.value = res.data.getProjects.totalPrepareForDeployment;
  totalProcessing.value = res.data.getProjects.totalProcessing;
  totalCompleted.value = res.data.getProjects.totalCompleted;
  totalPause.value = res.data.getProjects.totalPause;
  totalCancel.value = res.data.getProjects.totalCancel;
  totalClose.value = res.data.getProjects.totalClose;

  animateCount(totalFilter, totalFilter.value);
  animateCount(totalImplement, totalImplement.value);
  animateCount(totalAdmin, totalAdmin.value);
  animateCount(totalFollow, totalFollow.value);

  chartData.value = setChartData();
});

const setChartData = (): ChartData<'doughnut'> => {
  return {
    labels: legendItems.map(item => item.label),
    datasets: [
      {
        data: [totalCompleted.value, totalProcessing.value, totalUnderConstruction.value, totalPrepareForDeployment.value, totalPause.value, totalCancel.value],
        backgroundColor: legendItems.map(item => item.color),
        hoverBackgroundColor: legendItems.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      }
    ]
  };
};

onMounted(() => {
  chartOptions.value = setChartOptions();
});

load(undefined, {
  keyword: '',
  projectStatus: StatusProject.ALL,
  filterType: FilterType.ALL,
  searchProjectPayload: {}
});
</script>

<style scoped>
</style>
