<template>
  <div class='grid grid-nogutter'>
    <!-- Header Section -->
    <div class='col-12'>
      <div class='align-items-center flex justify-content-between mb-3'>
        <span class='font-bold text-2xl text-primary'>{{ t('admin.dashboard.dashboard.overview') }}</span>
      </div>
    </div>

    <!-- Cards Section - Responsive Grid Layout with Gap -->
    <div class='col-12'>
      <div class='grid grid-nogutter'>
        <!-- User Summary Card -->
        <div class='col-12 md:col-4 pr-2'>
          <div
            class='border-round h-full p-3 shadow-2'
            style='background-color: #FF8B4E;'>
            <div class='flex justify-content-between mb-3'>
              <div>
                <span class='block font-medium mb-3 text-500 text-white'>{{
                  t('admin.dashboard.dashboard.users')
                }}</span>
                <div class='font-medium text-900 text-white text-xl'>{{ userData.totalUsers }}</div>
              </div>
              <div
                class='align-items-center border-round flex justify-content-center'
                style='width: 2.5rem; height: 2.5rem; background-color: rgba(255, 255, 255, 0.2);'>
                <i class='pi pi-users text-white text-xl'></i>
              </div>
            </div>
            <span class='font-medium text-white'>{{ userData.newUsers }} new </span>
            <span class='text-white'>{{ t('admin.dashboard.dashboard.sinceLastVisit') }}</span>
          </div>
        </div>

        <!-- Role Summary Card -->
        <div class='col-12 md:col-4 px-2'>
          <div
            class='border-round h-full p-3 shadow-2'
            style='background-color: #94C748;'>
            <div class='flex justify-content-between mb-3'>
              <div>
                <span class='block font-medium mb-3 text-500 text-white'>{{
                  t('admin.dashboard.dashboard.roles')
                }}</span>
                <div class='font-medium text-900 text-white text-xl'>{{ roleData.totalRoles }}</div>
              </div>
              <div
                class='align-items-center border-round flex justify-content-center'
                style='width: 2.5rem; height: 2.5rem; background-color: rgba(255, 255, 255, 0.2);'>
                <i class='pi pi-shield text-white text-xl'></i>
              </div>
            </div>
            <span class='font-medium text-white'>{{ roleData.newRoles }} new </span>
            <span class='text-white'>{{ t('admin.dashboard.dashboard.sinceLastVisit') }}</span>
          </div>
        </div>

        <!-- Organization Summary Card -->
        <div class='col-12 md:col-4 pl-2'>
          <div
            class='border-round h-full p-3 shadow-2'
            style='background-color: rgb(13, 150, 250);'>
            <div class='flex justify-content-between mb-3'>
              <div>
                <span class='block font-medium mb-3 text-500 text-white'>{{
                  t('admin.dashboard.dashboard.organizations')
                }}</span>
                <div class='font-medium text-900 text-white text-xl'>{{ orgData.totalOrgs }}</div>
              </div>
              <div
                class='align-items-center border-round flex justify-content-center'
                style='width: 2.5rem; height: 2.5rem; background-color: rgba(255, 255, 255, 0.2);'>
                <i class='pi pi-building text-white text-xl'></i>
              </div>
            </div>
            <span class='font-medium text-white'>{{ orgData.newOrgs }} new </span>
            <span class='text-white'>{{ t('admin.dashboard.dashboard.sinceLastVisit') }}</span>
          </div>
        </div>
      </div>

      <!-- Chart Section - Full Width -->
      <div class='col-12 mt-4 px-0'>
        <div class='border-round-sm card shadow-none'>
          <div class='align-items-center flex justify-content-between mb-3'>
            <span class='font-bold text-lg'>{{ t('admin.dashboard.dashboard.systemPerformance') }}</span>
          </div>
          <div class='chart-container'>
            <Chart
              class='w-full'
              :data='chartData'
              :options='chartOptions'
              type='bar'/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import Chart from 'primevue/chart';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { allOrganizationCountSubOrgPublic } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';

const props = defineProps({
  selectedYear: {
    type: Number,
    default: new Date().getFullYear()
  },
  selectedOrganization: {
    type: String,
    default: undefined
  }
});

const { t } = useI18n();

const roleData = ref({
  totalRoles: 0,
  newRoles: 0
});

const orgData = ref({
  totalOrgs: 0,
  newOrgs: 0
});

// Chart data and options
const chartData = ref({
  labels: [] as string[],
  datasets: [] as any[]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top', }, },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: 1000,
    },
    y2: {
      type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
      position: 'right',
      grid: { drawOnChartArea: false }
    },
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
      },
    },
  },
});
const { onResult: getAllOrganizationResult, } = allOrganizationCountSubOrgPublic();
const organizations = ref<OrganizationInterface[]>([]);
getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationCountSubOrgPublic', []);
});

// // Mock API functions - Replace these with actual API calls
// async function fetchUserData(year: number) {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 500));
//
//   // Mock data - replace with actual API call
//   userData.value = {
//     totalUsers: 12452,
//     newUsers: 0,
//     growthData: [12, 19, 3, 5, 2, 3, 9, 15, 10, 8, 14, 20]
//   };
// }

const userData = computed(() => {
  const countUser = organizations.value?.find(
    (item) => item.id === props.selectedOrganization
  )?.totalUsers;

  return {
    totalUsers: countUser || 0,
    newUsers: 0,
    growthData: [12, 19, 3, 5, 2, 3, 9, 15, 10, 8, 14, 20]
  };
});

async function fetchRoleData(year: number) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock data - replace with actual API call
  roleData.value = {
    totalRoles: 24,
    newRoles: 2
  };
}

async function fetchOrgData(year: number) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock data - replace with actual API call
  orgData.value = {
    totalOrgs: 12,
    newOrgs: 1
  };
}

// Fetch all data
async function fetchAllData(year: number) {
  try {
    await Promise.all([
      fetchRoleData(year),
      fetchOrgData(year)
    ]);

    // Update chart data after data is loaded
    updateChartData();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
}

// Update chart data
function updateChartData() {
  const documentStyle = getComputedStyle(document.documentElement);
  const months = [
    t('admin.dashboard.dashboard.jan'),
    t('admin.dashboard.dashboard.feb'),
    t('admin.dashboard.dashboard.mar'),
    t('admin.dashboard.dashboard.apr'),
    t('admin.dashboard.dashboard.may'),
    t('admin.dashboard.dashboard.jun'),
    t('admin.dashboard.dashboard.jul'),
    t('admin.dashboard.dashboard.aug'),
    t('admin.dashboard.dashboard.sep'),
    t('admin.dashboard.dashboard.oct'),
    t('admin.dashboard.dashboard.nov'),
    t('admin.dashboard.dashboard.dec')
  ];

  // Mock data - replace with actual data
  const requestData = [120, 190, 130, 150, 120, 130, 190, 250, 200, 180, 240, 300]; // Bar chart data
  const responseTimeData = [25, 32, 21, 28, 20, 23, 31, 42, 35, 30, 38, 45]; // Line chart data

  chartData.value = {
    labels: months,
    datasets: [
      {
        label: t('admin.dashboard.dashboard.requests'),
        yAxisID: 'y',
        data: requestData,
        backgroundColor: documentStyle.getPropertyValue('--pink-200'),
        borderColor: documentStyle.getPropertyValue('--pink-200'),
        borderWidth: 1,
        order: 1
      },
      {
        label: t('admin.dashboard.dashboard.responseTime'),
        type: 'line',
        yAxisID: 'y2',
        data: responseTimeData,
        backgroundColor: documentStyle.getPropertyValue('--blue-500'),
        borderColor: documentStyle.getPropertyValue('--blue-500'),
        order: 0
      }
    ]
  };
}

// Watch for year changes
watch(() => props.selectedYear, (newYear) => {
  fetchAllData(newYear);
});

onMounted(() => {
  try {
    // Fetch initial data
    fetchAllData(props.selectedYear);
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
});
</script>

<style scoped>
.card {
  background-color: var(--surface-card);
}

/* Ensure cards have consistent height */
:deep(.p-card) {
  height: 100%;
}

/* Chart container adjustments to match ChartDocByTypeComparison */
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