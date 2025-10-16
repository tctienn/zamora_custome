<template>
  <div class='grid grid-nogutter'>
    <!-- Header Section -->
    <div class='col-12'>
      <div class='align-items-center flex justify-content-between mb-3'>
        <span class='font-bold text-2xl text-primary'>{{ t("document.dashboard.personalSummary") }}</span>
        <Dropdown
          v-model='selectedYear'
          :options='years' />
      </div>
    </div>

    <!-- Cards Section - Responsive Grid Layout with Gap -->
    <div class='col-12'>
      <div class='grid grid-nogutter'>
        <!-- Present File Card (for non-VAN_THU users) -->
        <div
          v-if="userDeptRole.roleId != 'VAN_THU'"
          class='col-12 md:col-4 p-2'>
          <PersonalPresentFileCard :year='selectedYear' />
        </div>
        <!-- Incoming Card -->
        <div
          v-else
          class='col-12 md:col-4 p-2'>
          <PersonalIncomingCard :year='selectedYear' />
        </div>
        <!-- Incoming Card -->
        <div class='col-12 md:col-4 p-2'>
          <PersonalIncomingCard
            :bg-class="'bg-green-cus'"
            :year='selectedYear'/>
        </div>
        <!-- Outgoing Card -->
        <div class='col-12 md:col-4 p-2'>
          <PersonalOutgoingCard :year='selectedYear' />
        </div>
      </div>
      
      <!-- Chart Section - Full Width -->
      <div class='col-12 mt-4 px-0'>
        <div class='border-round-sm card'>
          <div class='align-items-center flex justify-content-between mb-3'>
            <span class='font-bold text-lg'>{{ t("document.dashboard.chartTitle") }}</span>
          </div>
          <div class='chart-container'>
            <Chart
              class='w-full'
              :data='chartData'
              :options='chartOptions'
              type='bar' />
          </div>
        </div>
      </div>
      <div class='col-12 mt-2 px-0'>
        <div class='grid'>
          <!-- Tổng hợp Văn bản theo loại -->
          <div class='col-12'>
            <div class='border-round-sm card'>
              <div class='align-items-center flex justify-content-between mb-3'>
                <div class='font-bold'>Tổng hợp Văn bản theo loại</div>
                <SelectButton
                  v-model='viewModes.docByType'
                  :allow-empty='false'
                  class='view-button'
                  :options='viewOptions'>
                  <template #option='slotProps'>
                    <i
                      :class="{
                        'pi pi-table': slotProps.option === 'table',
                        'pi pi-chart-bar': slotProps.option === 'chart',
                      }"
                      style='font-size: 1.2rem'></i>
                  </template>
                </SelectButton>
              </div>
              <TableDocByType
                v-if="viewModes.docByType === 'table'"
                class='mt-2'
                :data='[...(docInCountByTypeInDeptResult?.docInCountByTypeInDept || []), ...(docOutCountByTypeInDeptResult?.docOutCountByTypeInDept || [])]'/>
              <ChartDocByTypeComparison
                v-else
                class='mt-2'
                :doc-in-data='docInCountByTypeInDeptResult?.docInCountByTypeInDept'
                :doc-out-data='docOutCountByTypeInDeptResult?.docOutCountByTypeInDept'
                title='So sánh Văn bản đến và đi theo loại'/>
            </div>
          </div>

          <!-- Tổng hợp Văn bản theo lĩnh vực -->
          <div class='col-12'>
            <div class='border-round-sm card'>
              <div class='align-items-center flex justify-content-between mb-3'>
                <div class='font-bold'>Tổng hợp Văn bản theo lĩnh vực</div>
                <SelectButton
                  v-model='viewModes.docByArea'
                  :allow-empty='false'
                  class='view-button'
                  :options='viewOptions'>
                  <template #option='slotProps'>
                    <i
                      :class="{
                        'pi pi-table': slotProps.option === 'table',
                        'pi pi-chart-bar': slotProps.option === 'chart',
                      }"
                      style='font-size: 1.2rem'></i>
                  </template>
                </SelectButton>
              </div>
              <TableDocByArea
                v-if="viewModes.docByArea === 'table'"
                class='mt-2'
                :data='[...(docInCountByAreaInDeptResult?.docInCountByAreaInDept || []), ...(docOutCountByAreaInDeptResult?.docOutCountByAreaInDept || [])]'/>
              <ChartDocByAreaComparison
                v-else
                class='mt-2'
                :doc-in-data='docInCountByAreaInDeptResult?.docInCountByAreaInDept'
                :doc-out-data='docOutCountByAreaInDeptResult?.docOutCountByAreaInDept'
                title='So sánh Văn bản đến và đi theo lĩnh vực'/>
            </div>
          </div>

          <!-- Tổng hợp Văn bản theo đơn vị ban hành -->
          <div class='col-12'>
            <div class='border-round-sm card'>
              <div class='align-items-center flex justify-content-between mb-3'>
                <div class='font-bold'>Tổng hợp Văn bản theo đơn vị ban hành</div>
                <SelectButton
                  v-model='viewModes.docByPublisher'
                  :allow-empty='false'
                  class='view-button'
                  :options='viewOptions'>
                  <template #option='slotProps'>
                    <i
                      :class="{
                        'pi pi-table': slotProps.option === 'table',
                        'pi pi-chart-bar': slotProps.option === 'chart',
                      }"
                      style='font-size: 1.2rem'></i>
                  </template>
                </SelectButton>
              </div>
              <TableDocByPublisher
                v-if="viewModes.docByPublisher === 'table'"
                class='mt-2'
                :data='docInCountByPublisherInDeptResult?.docInCountByPublisherInDept'/>
              <ChartDocByPublisher
                v-else
                class='mt-2'
                :data='docInCountByPublisherInDeptResult?.docInCountByPublisherInDept'/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ChartData } from 'chart.js';
import type { ChartOptions } from 'chart.js/dist/types';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getOrgOut } from '@/apps/document/api/graphql/org-out';
import {
  docInCountByAreaInDept, docInCountByPublisherInDept,
  docInCountByTypeInDept,
  docInProcessedStatistic, docOutCountByAreaInDept, docOutCountByTypeInDept,
  docOutProcessedStatistic,
} from '@/apps/document/api/graphql/statistic';
import type { OrgOutInterface } from '@/apps/document/model/orgOut';
import type { DocStatistic } from '@/apps/document/model/statistic';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import ChartDocByPublisher from '@/apps/document/views/dashboard/components/ChartDocByPublisher.vue';
import ChartDocByAreaComparison from '@/apps/document/views/dashboard/components/dept/ChartDocByAreaComparison.vue';
import ChartDocByTypeComparison from '@/apps/document/views/dashboard/components/dept/ChartDocByTypeComparison.vue';
import TableDocByArea from '@/apps/document/views/dashboard/components/dept/TableDocByArea.vue';
import TableDocByType from '@/apps/document/views/dashboard/components/dept/TableDocByType.vue';
import PersonalIncomingCard from '@/apps/document/views/dashboard/components/personal/PersonalIncomingCard.vue';
import PersonalOutgoingCard from '@/apps/document/views/dashboard/components/personal/PersonalOutgoingCard.vue';
import PersonalPresentFileCard from '@/apps/document/views/dashboard/components/personal/PersonalPresentFileCard.vue';
import TableDocByPublisher from '@/apps/document/views/dashboard/components/TableDocByPublisher.vue';
import { useThemeStore } from '@/common/store/theme';

import { calculateStepSize } from './dept/chartUtils';

const { t } = useI18n();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { dark } = storeToRefs(useThemeStore());
const now = new Date();
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
const selectedYear = ref(now.getFullYear());
const { onResult: getOrgResult } = getOrgOut();
const orgOuts = ref<string[]>([]);

getOrgResult((res) => {
  orgOuts.value = res.data.getOrgOut.map((org: OrgOutInterface) => org.id) as string[];
  // Cập nhật variables cho docInCountByPublisherInDept sau khi orgOuts có dữ liệu
  if (orgOuts.value.length > 0) {
    docInCountByPublisherInDeptResultVariables.value = {
      year: selectedYear.value,
      deptId: userDeptRole.value.deptId,
      publisherIds: []
    };
  }
  // if (!id) {
  //   doc.value.publisherId = (
  //     orgOuts.value.length > 0 ? orgOuts.value[0].id : null
  //   )!;
  // }
});
// State for switching between table and chart views
const viewModes = ref({
  docByType: 'chart', // 'table' or 'chart'
  docByArea: 'chart',
  docByPublisher: 'chart'
});

// View options for SelectButton
const viewOptions = ref(['table', 'chart']);

// Function to toggle view mode
const toggleViewMode = (section: string) => {
  const currentMode = viewModes.value[section as keyof typeof viewModes.value];
  viewModes.value[section as keyof typeof viewModes.value] =
    currentMode === 'table' ? 'chart' : 'table';
};

// Function to get button label based on view mode
const getViewModeLabel = (section: string) => {
  const currentMode = viewModes.value[section as keyof typeof viewModes.value];
  return currentMode === 'table' ? 'Xem biểu đồ' : 'Xem bảng';
};

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
const { result: docInCountByTypeInDeptResult, } = docInCountByTypeInDept(selectedYear.value, userDeptRole.value.deptId);
const { result: docInCountByAreaInDeptResult, } = docInCountByAreaInDept(selectedYear.value, userDeptRole.value.deptId);

// Sử dụng useQuery để quản lý docInCountByPublisherInDept
const {
  result: docInCountByPublisherInDeptResult,
  variables: docInCountByPublisherInDeptResultVariables,
} = docInCountByPublisherInDept(
  selectedYear.value,
  userDeptRole.value.deptId,
  orgOuts.value.length > 0 ? orgOuts.value : ['']
);

const { result: docOutCountByTypeInDeptResult, } = docOutCountByTypeInDept(selectedYear.value, userDeptRole.value.deptId);

const { result: docOutCountByAreaInDeptResult, } = docOutCountByAreaInDept(selectedYear.value, userDeptRole.value.deptId);
watch(
  [() => userDeptRole.value.deptId, () => userDeptRole.value.roleId, selectedYear],
  ([deptId, roleId, selectedYearValue]) => {
    docInProcessedStatisticVariables.value = {
      year: selectedYearValue,
      userDeptRole: userDeptRole.value,
    };
    docOutProcessedStatisticVariables.value = {
      year: selectedYearValue,
      userDeptRole: userDeptRole.value,
    };
    
    // Cập nhật lại docInCountByPublisherInDept khi năm thay đổi
    if (orgOuts.value.length > 0) {
      docInCountByPublisherInDeptResultVariables.value = {
        year: selectedYearValue,
        deptId: deptId,
        publisherIds: []
      };
    }
  }
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

  const trimDataToCurrentMonth = (data: number[]) => {
    return selectedYear.value < currentYear
      ? data
      : data.slice(0, currentMonth + 1);
  };

  // Ensure we have valid data arrays even if the results are not yet loaded
  const incomingData = docInProcessedStatisticResult.value?.docInProcessedStatistic 
    ? toFlatData(docInProcessedStatisticResult.value.docInProcessedStatistic)
    : Array(labels.length).fill(0);
    
  const outgoingData = docOutProcessedStatisticResult.value?.docOutProcessedStatistic 
    ? toFlatData(docOutProcessedStatisticResult.value.docOutProcessedStatistic)
    : Array(labels.length).fill(0);

  return {
    labels,
    datasets: [
      {
        label: t('document.dashboard.incomingDoc'),
        backgroundColor: documentStyle.getPropertyValue('--blue-400'),
        borderColor: documentStyle.getPropertyValue('--blue-400'),
        data: trimDataToCurrentMonth(incomingData),
      },
      {
        label: t('document.dashboard.outgoingDoc'),
        backgroundColor: documentStyle.getPropertyValue('--pink-200'),
        borderColor: documentStyle.getPropertyValue('--pink-200'),
        data: trimDataToCurrentMonth(outgoingData),
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

// Cập nhật chart options khi dữ liệu thay đổi
watch([docInProcessedStatisticResult, docOutProcessedStatisticResult], () => {
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
    responsive: true,
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
  // Delay một chút để đảm bảo component đã mount hoàn toàn
  setTimeout(() => {
    docInProcessedStatisticLoad();
    docOutProcessedStatisticLoad();
  }, 100);
});

onUnmounted(() => {
  // Cleanup nếu cần
});
</script>

<style scoped>
:deep(.p-chart) {
  display: flex;
  justify-content: center;
}

/* Ensure cards have consistent height */
:deep(.p-card) {
  height: 100%;
}

/* Responsive adjustments */
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
