<template>
  <div class='mt-3'>
    <DataTable
      :rows='size'
      scroll-height='calc(100vh - 12.5rem)'
      scrollable
      show-gridlines
      :value='employees'>
      <template #empty>
        <ProgressBar
          v-if='loading'
          class='border-noround'
          mode='indeterminate'
          style='height: .25rem'></ProgressBar>
        <EmptyResult v-else/>
      </template>
      <Column
        body-class='text-center'
        field='year'
        frozen
        header='Năm'
        header-class='p-2'
        style='min-width:2rem'></Column>
      <Column
        body-class='text-center'
        field='remainingLeaveLastYear'
        frozen
        header='Phép tồn'
        header-class='p-2'
        style='min-width:2rem; background: #FAFAFA;'></Column>
      <Column
        body-class='text-center'
        field='annualLeave'
        frozen
        header='Phép năm'
        header-class='p-2'
        style='min-width:2rem; background: #EFF3F8;'></Column>
      <Column
        body-class='text-center'
        field='bonusLeave'
        frozen
        header='Phép thưởng'
        header-class='p-2'
        style='min-width:2rem'></Column>
      <Column
        body-class='text-center'
        field='seniorityLeave'
        frozen
        header='Thâm niên'
        header-class='p-2'
        style='min-width:2rem'></Column>
      <Column
        body-class='text-center'
        field='totalLeave'
        frozen
        header='Tổng phép'
        header-class='p-2'
        style='min-width:2rem; background: #FFF5F5;'></Column>
      <Column
        v-for='c in months'
        :key='c.value'
        body-class='p-1'
        class='text-center'
        :header='c.label'
        header-class='p-2'
        style='min-width: 4rem'>
        <template #body='{data: {monthlyLeaves}}'>
          <p>{{monthlyLeaves[c.label]}}</p>
        </template>
      </Column>
      <Column
        body-class='text-center'
        field='takenLeave'
        header='Đã nghỉ'
        header-class='p-2'
        style='min-width:2rem; background: #EDFFF2;'></Column>
      <Column
        body-class='text-center'
        field='remainingLeave'
        header='Còn lại'
        header-class='p-2'
        style='min-width:2rem; background: #FFF9ED'></Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { employeeShifts } from '@/apps/hrm/api/graphql/shift';
import type { EmployeeFilter } from '@/apps/hrm/model/employee';
import EmptyResult from '@/common/components/empty/EmptyResult.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';

const props = defineProps({
  joinDate: {
    type: [String, Date], // ✅ Cho phép cả string lẫn Date
    default: null,
  },
});

const { t } = useI18n();
const filter = reactive<EmployeeFilter>({});
const size = 50;
const { moment } = useMoment();
const months = Array.from({ length: 12 }, (_, i) => ({
  label: `T${moment().month(i).format('M')}`, // "Jan", "Feb", ...
  value: i,
}));
const employees = [
  {
    year: 2024,
    remainingLeaveLastYear: 2,
    annualLeave: 12,
    bonusLeave: 1,
    seniorityLeave: 2,
    totalLeave: 17,
    monthlyLeaves: {
      T1: 0,
      T2: 1,
      T3: 0.5,
      T4: 1,
      T5: 0,
      T6: 1,
      T7: 2,
      T8: 0,
      T9: 1,
      T10: 0,
      T11: 1,
      T12: 0,
    },
    takenLeave: 7.5,
    remainingLeave: 9.5,
  },
  {
    year: 2023,
    remainingLeaveLastYear: 1,
    annualLeave: 12,
    bonusLeave: 0,
    seniorityLeave: 1,
    totalLeave: 14,
    monthlyLeaves: {
      T1: 1,
      T2: 0.5,
      T3: 0,
      T4: 1,
      T5: 0.5,
      T6: 0,
      T7: 0,
      T8: 0,
      T9: 1,
      T10: 1,
      T11: 0,
      T12: 0.5,
    },
    takenLeave: 5.5,
    remainingLeave: 8.5,
  }
];

const pageable = reactive<Pageable>({
  page: 0,
  size,
});
const {
  result,
  loading
} = employeeShifts(filter, pageable);
// const employees = computed(() => (result.value?.employeeShifts as Connection<EmployeeShifts>)?.edges.map((edge) => edge.node) || []);

function isWeekend(date: string) {
  const day = moment(date).day();
  return day === 0 || day === 6;
}
</script>