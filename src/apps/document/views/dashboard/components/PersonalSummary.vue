<template>
  <div class='flex flex-column gap-2'>
    <div class='align-items-center flex justify-content-between'>
      <span class='font-bold text-primary text-xl'>{{
        t("document.dashboard.personalSummary")
      }}</span>
      <Dropdown
        v-model='selectedYear'
        :options='years'/>
    </div>

    <div class='flex flex-column gap-2'>
      <PersonalIncomingCard :year='selectedYear'/>
      <PersonalOutgoingCard :year='selectedYear'/>
      <PersonalPresentFileCard
        v-if="userDeptRole.roleId != 'VAN_THU'"
        :year='selectedYear'/>
    </div>

    <span class='font-bold'>{{ t("document.dashboard.chartTitle") }}</span>
    <div class='card'>
      <Chart
        class='h-25rem'
        :data='chartData'
        :options='chartOptions'
        type='bar'/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ChartData } from 'chart.js';
import type { ChartOptions } from 'chart.js/dist/types';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  docInProcessedStatistic,
  docOutProcessedStatistic,
} from '@/apps/document/api/graphql/statistic';
import type { DocStatistic } from '@/apps/document/model/statistic';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import PersonalIncomingCard from '@/apps/document/views/dashboard/components/personal/PersonalIncomingCard.vue';
import PersonalOutgoingCard from '@/apps/document/views/dashboard/components/personal/PersonalOutgoingCard.vue';
import PersonalPresentFileCard from '@/apps/document/views/dashboard/components/personal/PersonalPresentFileCard.vue';
import { useThemeStore } from '@/common/store/theme';

import { calculateStepSize } from './dept/chartUtils';

const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { dark } = storeToRefs(useThemeStore());
const now = new Date();
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
const selectedYear = ref(now.getFullYear());

const {
  result: docInProcessedStatisticResult,
  variables: docInProcessedStatisticVariables,
  load: docInProcessedStatisticLoad,
} = docInProcessedStatistic(now.getFullYear(), userDeptRole.value);
const {
  result: docOutProcessedStatisticResult,
  variables: docOutProcessedStatisticVariables,
  load: docOutProcessedStatisticLoad,
} = docOutProcessedStatistic(now.getFullYear(), userDeptRole.value);

watch(
  [userDeptRole, selectedYear],
  ([userDeptRoleValue, selectedYearValue]) => {
    docInProcessedStatisticVariables.value = {
      year: selectedYearValue,
      userDeptRole: userDeptRoleValue,
    };
    docOutProcessedStatisticVariables.value = {
      year: selectedYearValue,
      userDeptRole: userDeptRoleValue,
    };
  },
);

const chartData = computed((): ChartData => {
  const documentStyle = getComputedStyle(document.documentElement);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const labels =
      selectedYear.value < currentYear
        ? [
          t('document.dashboard.january'),
          t('document.dashboard.february'),
          t('document.dashboard.march'),
          t('document.dashboard.april'),
          t('document.dashboard.may'),
          t('document.dashboard.june'),
          t('document.dashboard.july'),
          t('document.dashboard.august'),
          t('document.dashboard.september'),
          t('document.dashboard.october'),
          t('document.dashboard.november'),
          t('document.dashboard.december'),
        ]
        : [
          t('document.dashboard.january'),
          t('document.dashboard.february'),
          t('document.dashboard.march'),
          t('document.dashboard.april'),
          t('document.dashboard.may'),
          t('document.dashboard.june'),
          t('document.dashboard.july'),
          t('document.dashboard.august'),
          t('document.dashboard.september'),
          t('document.dashboard.october'),
          t('document.dashboard.november'),
          t('document.dashboard.december'),
        ].slice(0, currentMonth + 1);

  const trimDataToCurrentMonth = (data: any[]) => {
    return selectedYear.value < currentYear
      ? data
      : data.slice(0, currentMonth + 1);
  };

  return {
    labels,
    datasets: [
      {
        label: t('document.dashboard.incomingDoc'),
        backgroundColor: documentStyle.getPropertyValue('--blue-400'),
        borderColor: documentStyle.getPropertyValue('--blue-400'),
        data: trimDataToCurrentMonth(
          toFlatData(
            docInProcessedStatisticResult.value?.docInProcessedStatistic,
          ),
        ),
      },
      {
        label: t('document.dashboard.outgoingDoc'),
        backgroundColor: documentStyle.getPropertyValue('--pink-200'),
        borderColor: documentStyle.getPropertyValue('--pink-200'),
        data: trimDataToCurrentMonth(
          toFlatData(
            docOutProcessedStatisticResult.value?.docOutProcessedStatistic,
          ),
        ),
      },
    ],
  };
});

const chartOptions = ref<ChartOptions>(getChartOptions());
watch(dark, () => {
  setTimeout(() => {
    chartOptions.value = getChartOptions();
  }, 100);
});

function getChartOptions(): ChartOptions {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  // Tính toán step size dựa trên dữ liệu
  let maxCount = 0;
  const flatData = [
    ...docInProcessedStatisticResult.value?.docInProcessedStatistic ? toFlatData(docInProcessedStatisticResult.value.docInProcessedStatistic) : [],
    ...docOutProcessedStatisticResult.value?.docOutProcessedStatistic ? toFlatData(docOutProcessedStatisticResult.value.docOutProcessedStatistic) : []
  ];
  
  if (flatData.length > 0) {
    maxCount = Math.max(...flatData);
  }
  
  // Đảm bảo luôn có giá trị max tối thiểu là 10
  maxCount = Math.max(maxCount, 10);
  
  // Xác định step size phù hợp
  const stepSize = calculateStepSize(maxCount);

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: {
          font: { weight: 600 },
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: maxCount,
        ticks: { 
          color: textColor,
          stepSize: stepSize
        },
        grid: { color: surfaceBorder },
      },
    },
  };
}

function toFlatData(data: DocStatistic | undefined): number[] {
  return [
    data?.jan || 0,
    data?.feb || 0,
    data?.mar || 0,
    data?.apr || 0,
    data?.may || 0,
    data?.jun || 0,
    data?.jul || 0,
    data?.aug || 0,
    data?.sep || 0,
    data?.oct || 0,
    data?.nov || 0,
    data?.dec || 0,
  ];
}

onMounted(() => {
  docInProcessedStatisticLoad();
  docOutProcessedStatisticLoad();
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 25rem;
  width: 100%;
  overflow: hidden;
}

.chart-container :deep(.p-chart) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.chart-container :deep(canvas) {
  max-width: 100%;
  max-height: 100%;
}

/* Responsive height adjustments */
@media screen and (max-width: 768px) {
  .chart-container {
    height: 20rem;
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .chart-container {
    height: 22rem;
  }
}

@media screen and (min-width: 1025px) {
  .chart-container {
    height: 25rem;
  }
}
</style>
