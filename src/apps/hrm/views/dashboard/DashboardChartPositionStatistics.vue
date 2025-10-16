<template>
  <div class='h-full'>
    <div
      style='font-size: 18px;
      font-weight: bold;
      color: #1A4F9C;
      padding: 0 0 1rem 0;
      text-align: center;'>
      Thâm niên công tác cao nhất
    </div>

    <div class='chart-container'>
      <Chart
        id='userBarChart'
        :data='seniorityChartData'
        :options='seniorityChartOptions'
        type='bar'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js';
import { computed, ref, watch } from 'vue';

import { dashboardOrgEmployees, getTopSeniorityEmployee } from '@/apps/hrm/api/graphql/employee';
import type { DashboardOrgEmployee } from '@/apps/hrm/model/employee';
import { useAvatarBarChart } from '@/common/helpers/chart-plugins/avatar-bar-chart';

const props = defineProps<{
  organizationId?: string | null;
}>();

// Data for original chart
const orgData = ref([] as DashboardOrgEmployee[]);
const topSeniorityData = ref([] as any[]);
const { plugin } = useAvatarBarChart();

let currentOrgApiCall: ReturnType<typeof dashboardOrgEmployees> | null = null;
let currentSeniorityApiCall: ReturnType<typeof getTopSeniorityEmployee> | null = null;

const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  return '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
};

// Function to fetch org data based on organizationId
const fetchOrgEmployeesData = (orgId: string | null) => {
  if (orgId) {
    currentOrgApiCall = dashboardOrgEmployees(orgId);
    currentOrgApiCall.onResult((res) => {
      orgData.value = res.data?.dashboardOrgEmployees ? res.data.dashboardOrgEmployees : [];
    });
  } else {
    // Clear the data if no organizationId is provided
    orgData.value = [];
  }
};

// Function to fetch seniority data based on organizationId
const fetchSeniorityData = (orgId: string | null) => {
  if (orgId) {
    currentSeniorityApiCall = getTopSeniorityEmployee(5, orgId);
    currentSeniorityApiCall.onResult((res) => {
      if (res.data?.getTopSeniorityEmployee) {
        topSeniorityData.value = res.data.getTopSeniorityEmployee;
      } else {
        topSeniorityData.value = [];
      }
    });
  } else {
    // Clear the data if no organizationId is provided
    topSeniorityData.value = [];
  }
};

// Initialize data if organizationId is provided
if (props.organizationId) {
  fetchOrgEmployeesData(props.organizationId);
  fetchSeniorityData(props.organizationId);
}

// ORIGINAL CHART: Thống kê nhân sự theo đơn vị
const orgChartData = computed<ChartData<'bar'>>(() => {
  const labels = orgData.value.map((d) => d.orgName);
  const totals = orgData.value.map((d) => d.total);
  const colors = orgData.value.map(() => getRandomColor());

  return {
    labels,
    datasets: [
      {
        backgroundColor: colors,
        data: totals
      }
    ]
  };
});

// NEW CHART: Thâm niên công tác cao nhất
const seniorityChartData = computed(() => {
  return {
    labels: [...topSeniorityData.value.map(emp => emp.fullName)],
    userId: [...topSeniorityData.value.map(emp => emp.employeeId)],
    datasets: [
      {
        label: 'Số năm công tác',
        backgroundColor: '#42A5F5',
        data: [...topSeniorityData.value.map(emp => Math.round(emp.totalDate / 365))]
      }
    ]
  };
});

const seniorityChartOptions = ref<ChartOptions<'bar'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    avatarBarChart: {
      idFieldName: 'userId',
      containerId: 'userBarChart'
    },
    legend: { position: 'bottom' }
  },
});

// Watch for changes in organizationId and refetch data
watch(() => props.organizationId, (newOrgId: string | null | undefined) => {
  // Cancel the previous subscriptions if they exist
  if (currentOrgApiCall) {
    currentOrgApiCall.stop();
  }
  if (currentSeniorityApiCall) {
    currentSeniorityApiCall.stop();
  }

  fetchOrgEmployeesData(newOrgId ?? null);
  fetchSeniorityData(newOrgId ?? null);
}, { immediate: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  margin: auto;
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
  max-width: 900px;
  margin: auto;
}

:deep(.p-chart) {
  height: 300px !important;
}
</style>
