<template>
  <div
    class='h-full surface-200'>
    <div class='surface-200'>
      <div class='p-2'>
        <!-- <DashboardChartFilter
          v-model:departmentId='departmentId'
          v-model:yearModel='yearModel'/> -->
        <div class='grid-layout-chart'>
          <div
            v-if='roles.includes(RoleType.LANH_DAO) || roles.includes(RoleType.TRUONG_PHONG)'
            class='p-4 surface-50'>
            <DashboardChartMission/>
          </div>
          <div
            v-if='roles.includes(RoleType.LANH_DAO) || roles.includes(RoleType.TRUONG_PHONG)'
            class='p-4 surface-50'>
            <DashboardChartActivity/>
          </div>
          <div
            class='p-4 surface-50'>
            <DashboardChartJobByMission :roles-user = 'roles'/>
          </div>
          <div
            class='p-4 surface-50'>
            <DashboardChartJobOther :roles-user = 'roles'/>
          </div>
          <div
            v-if='roles.includes(RoleType.NHAN_VIEN)'
            class='p-4 surface-50'>
            <DashboardChartTotalJob
              v-model:departmentId='departmentId'
              v-model:yearModel='yearModel'/>
          </div>
        </div>
        <div
          v-if='roles.includes(RoleType.LANH_DAO) || roles.includes(RoleType.TRUONG_PHONG)'
          class='grid-layout-unit mt-3'>
          <div
            class='p-4 surface-50'>
            <DashboardChartJobByUnit :roles-user = 'roles'/>
          </div>
          <div
            class='p-4 surface-50'>
            <DashboardChartEmployeeReport/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { get } from 'lodash';
import { ref } from 'vue';

import { currentUser } from '@/apps/admin/api/graphql/admin-customer-tenant';
import DashboardChartActivity from '@/apps/mission/views/dashboard/DashboardChartActivity.vue';
import DashboardChartJobByMission from '@/apps/mission/views/dashboard/DashboardChartJobByMission.vue';
import DashboardChartJobOther from '@/apps/mission/views/dashboard/DashboardChartJobOther.vue';
import DashboardChartMission from '@/apps/mission/views/dashboard/DashboardChartMission.vue';

import { RoleType } from '../../model/job/job';
import DashboardChartEmployeeReport from './DashboardChartEmployeeReport.vue';
import DashboardChartJobByUnit from './DashboardChartJobByUnit.vue';
import DashboardChartTotalJob from './DashboardChartTotalJob.vue';
const roles = ref<string[]>([]);

currentUser().onResult((res) => {
  roles.value = get(res, 'data.currentUser.roles', []);
});

const departmentId = ref<string | null>(null);
const yearModel = ref<Date | null>(new Date);

</script>

<style scoped>

.grid-layout-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 1rem;
}
.grid-layout-unit {
  display: grid;
  grid-template-columns: minmax(0, 3.08fr) minmax(0, 1fr);
  gap: 1rem;
}
</style>
