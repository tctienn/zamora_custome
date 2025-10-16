<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    show-gridlines
    :value='data'>
    <ColumnGroup type='header'>
      <Row>
        <Column
          header='TT'
          :rowspan='2'/>
        <Column
          header='Nhân viên'
          :rowspan='2'/>
        <Column
          header='Phòng ban'
          :rowspan='2'/>
        <Column
          class='text-center'
          header='Tổng dự án quản trị'
          :rowspan='2'/>
        <Column
          :colspan='3'
          header='Công việc đang thực hiện'/>
        <Column
          :colspan='3'
          header='Công việc hoàn thành'/>
      </Row>
      <Row>
        <Column header='Tổng'/>
        <Column header='Còn hạn'/>
        <Column header='Quá hạn'/>
        <Column header='Tổng'/>
        <Column header='Đúng hạn'/>
        <Column header='Quá hạn'/>
      </Row>
    </ColumnGroup>
    <Column
      class='text-center'
      header='#'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>

    <Column
      field='admin'
      style='min-width: 13vw'>
      <template #body='{ data: { admin } }'>
        {{
          usersMoreInfo[admin]?.fullName

        }}
      </template>
    </Column>
    <Column
      class='text-center'
      style='min-width: 5vw'>
      <template #body='{ data: { admin } }'>
        {{
          findUserDepartment(admin)?.name
        }}
      </template>
    </Column>
    <Column
      class='text-center'
      field='countProject'
      style='min-width: 5vw'>
    </Column>

    <Column
      class='text-center'
      field='doingTask'
      style='min-width: 5vw'>
    </Column>
    <Column
      body-class='statusName'
      class='text-center'
      field='stillDueTask'
      style='min-width: 7vw'>
      <template #body='{ data: { stillDueTask, doingTask } }'>
        <div>{{ stillDueTask }} {{ calPercent(stillDueTask, doingTask) }}</div>
      </template>
    </Column>
    <Column
      body-class='numDayExtend'
      class='text-center'
      field='overdueTask'
      style='min-width: 7vw'>
      <template #body='{ data: { overdueTask, doingTask } }'>
        <div>{{ overdueTask }} {{ calPercent(overdueTask, doingTask) }}</div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='doneTask'
      style='min-width: 5vw'>
    </Column>
    <Column
      body-class='statusName'
      class='text-center'
      field='stillDueDoneTask'
      style='min-width: 7vw'>
      <template #body='{ data: { stillDueDoneTask, doneTask } }'>
        <div>{{ stillDueDoneTask }} {{ calPercent(stillDueDoneTask, doneTask) }}</div>
      </template>
    </Column>
    <Column
      body-class='numDayExtend'
      class='text-center'
      field='overdueDoneTask'
      style='min-width: 7vw'>
      <template #body='{ data: { overdueDoneTask, doneTask } }'>
        <div>{{ overdueDoneTask }} {{ calPercent(overdueDoneTask, doneTask) }}</div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { ref } from 'vue';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getProjectManagementSummary } from '@/apps/work/api/graphql/report';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';

const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const data = ref();
getProjectManagementSummary().onResult((res) => {
  data.value = res.data.getProjectManagementSummary;
});

const calPercent = (data: number, sum: number): string => {
  if (sum > 0) {
    const percent = data / sum * 100;
    const display = Number.isInteger(percent) ? percent : percent.toFixed(1);
    return `(${display}%)`;
  } else {
    return '(0%)';
  }
};

function findUserDepartment(userId: any): any {
  return organizations.value.find((dept: any) =>
    dept.users.some((user: any) => user.id === userId)
  );
}

const organizations = ref([]);
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  organizations.value = response.data.allOrganizationPublic;
});
</script>

<style scoped>
:deep(.numDayExtend) {
  background: #FFF5F5;
}

:deep(.statusName) {
  background: #F0FBF7;
}
</style>