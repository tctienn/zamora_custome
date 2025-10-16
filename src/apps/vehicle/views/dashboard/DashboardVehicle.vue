<template>
  <div class='flex gap-2 mb-2 w-full'>
    <TreeSelect
      v-model='deptId'
      class='w-30rem'
      display='chip'
      v-bind='$attrs'
      :options='organizations'
      :pt="{
        labelContainer: {
          style: 'width: 0vw',
        },
      }"
      selection-mode='single'
      @node-select='changeDept'>
    </TreeSelect>
    <Calendar
      v-model='date'
      date-format='yy'
      icon-display='input'
      show-icon
      view='year'/>
  </div>
  <div class='flex gap-3 w-full'>
    <div class='flex flex-column w-full'>
      <GeneralSummary :data='summaryDashboard'/>
      <SummaryCarBookingsByUnit :data='summaryCarBookingsUnit'/>
      <CarExecutesOrderDuringDay :data='freeAndBusyVehiclesToday'/>
    </div>
    <div class='flex flex-column w-full'>
      <SummaryTripsDuringDay :data='summaryDashboard'/>
      <SummaryDriverPerformance :data='summaryDriverStatisticsData'/>
      <CarIsFreeForTheDay :data='freeAndBusyVehiclesToday'/>
    </div>
    <div class='flex flex-column w-full'>
      <ProcessingSummary :data='summaryDashboard'/>
      <VehicleSummaryExecuteCommand :data='summaryCarStatisticsData'/>
      <SystemWarning/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { ref } from 'vue';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import {
  findFreeAndBusyVehiclesToday,
  getSummaryDashboard,
  summaryCarBookingsByUnit,
  summaryCarStatistics,
  summaryDriverStatistics
} from '@/apps/vehicle/api/graphql/booking-car';
import CarExecutesOrderDuringDay from '@/apps/vehicle/views/dashboard/components/CarExecutesOrderDuringDay.vue';
import CarIsFreeForTheDay from '@/apps/vehicle/views/dashboard/components/CarIsFreeForTheDay.vue';
import GeneralSummary from '@/apps/vehicle/views/dashboard/components/GeneralSummary.vue';
import ProcessingSummary from '@/apps/vehicle/views/dashboard/components/ProcessingSummary.vue';
import SummaryCarBookingsByUnit from '@/apps/vehicle/views/dashboard/components/SummaryCarBookingsByUnit.vue';
import SummaryDriverPerformance from '@/apps/vehicle/views/dashboard/components/SummaryDriverPerformance.vue';
import SummaryTripsDuringDay from '@/apps/vehicle/views/dashboard/components/SummaryTripsDuringDay.vue';
import SystemWarning from '@/apps/vehicle/views/dashboard/components/SystemWarning.vue';
import VehicleSummaryExecuteCommand from '@/apps/vehicle/views/dashboard/components/VehicleSummaryExecuteCommand.vue';
import { listToTree } from '@/common/helpers/utils';

const deptId = ref<Record<string, boolean>>({});
const date = ref(new Date());
const organizations = ref([]);
const listOrganizations = ref();
const summaryDashboard = ref();
const summaryCarBookingsUnit = ref();
const freeAndBusyVehiclesToday = ref();
const summaryCarStatisticsData = ref();
const summaryDriverStatisticsData = ref();
const {
  onResult: getSummaryDashboardResult,
  refetch: getSummaryDashboardRefetch
} = getSummaryDashboard('', new Date().getFullYear());

getSummaryDashboardResult((response) => {
  summaryDashboard.value = response.data.getSummaryDashboard || {};
});

const {
  onResult: summaryCarBookingsByUnitResult,
  refetch: summaryCarBookingsByUnitRefetch
} = summaryCarBookingsByUnit('', new Date().getFullYear());

summaryCarBookingsByUnitResult((response) => {
  summaryCarBookingsUnit.value = response.data.summaryCarBookingsByUnit || {};
});

const {
  onResult: summaryDriverStatisticsResult,
  refetch: summaryDriverStatisticsRefetch
} = summaryDriverStatistics('', new Date().getFullYear());

summaryDriverStatisticsResult((response) => {
  summaryDriverStatisticsData.value = response.data.summaryDriverStatistics || {};
});

const {
  onResult: summaryCarStatisticsResult,
  refetch: summaryCarStatisticsRefetch
} = summaryCarStatistics('', new Date().getFullYear());

summaryCarStatisticsResult((response) => {
  summaryCarStatisticsData.value = response.data.summaryCarStatistics || {};
});

const {
  onResult: findFreeAndBusyVehiclesTodayResult,
  refetch: findFreeAndBusyVehiclesTodayRefetch
} = findFreeAndBusyVehiclesToday('');

findFreeAndBusyVehiclesTodayResult((response) => {
  freeAndBusyVehiclesToday.value = response.data.findFreeAndBusyVehiclesToday || {};
});

const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  listOrganizations.value = get(response, 'data.allOrganizationPublic', []);
  const tree = listToTree(
    listOrganizations.value.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );

  tree.forEach((node: any) => {
    if (node.children) {
      node.children = node.children.map((child: any) => ({
        ...child,
        children: [],
      }));
    }
  });
  deptId.value = { [tree[0].key]: true };
  changeDept(tree[0]);
  organizations.value = tree;
});

const changeDept = (node: any) => {
  const key = node.key;
  getSummaryDashboardRefetch({
    organizationId: key,
    year: date.value.getFullYear()
  });
  findFreeAndBusyVehiclesTodayRefetch({ organizationId: key });
  summaryCarBookingsByUnitRefetch({
    organizationId: key,
    year: date.value.getFullYear()
  });
  summaryCarStatisticsRefetch({
    organizationId: key,
    year: date.value.getFullYear()
  });
  summaryDriverStatisticsRefetch({
    organizationId: key,
    year: date.value.getFullYear()
  });
};
</script>

<style scoped>

</style>