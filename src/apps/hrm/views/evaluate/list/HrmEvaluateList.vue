<template>
  <DataTable
    class='full-height-table h-full p-datatable-gridlines p-datatable-sm'
    :edit-mode="activeTab === 'MY_DEPT' && selectedReport?.report.evaluateStatus === 'DRAFT' ? 'cell' : undefined"
    :pt='{
      column: {
        bodyCell: bodyCellFunc
      }
    }'
    row-hover
    scroll-height='calc(100vh - 18.2rem)'
    scrollable
    show-gridlines
    table-style='table-layout: fixed'
    :value='localEmployees'>
    <ColumnGroup type='header'>
      <Row>
        <Column
          class='px-0'
          :header='t("mission.note.No")'
          :rowspan='2'
          style='width: 4rem;'/>
        <Column
          class='text-left w-15rem'
          
          :header='t("mission.note.fullName")'
          header-class='float-left'
          :rowspan='2'/>
        <Column
          :colspan='6'
          :header='t("Chấm điểm cho tháng (Trưởng phòng ban đánh giá)")'
          :rowspan='1' />
      </Row>
      <Row>
        <Column
          :header='t("Điểm tuần 01")'/>
        <Column
   
          :header='t("Điểm tuần 02")'/>
        <Column
   
          :header='t("Điểm tuần 03")'/>
        <Column
   
          :header='t("Điểm tuần 04")'/>
        <Column
          class='text-center'
          :header='t("Điểm tháng (BQ của tuần)")'/>
        <Column
   
          :header='t("Điểm làm tròn")'/>
      </Row>
    </ColumnGroup>
    <Column
      class='px-2 text-center'
      header='STT'
      style='width: 2%; padding-block: 0.75rem;'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      field='employeeName'
      :header='t("hrm.evaluate.general.fullName")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #body='{ data }'>
        {{ data.employeeName }}
      </template>
    </Column>
    <Column
      class='text-center'>
      <template #body='{ data }'>
        {{ data.score['scoreOfWeek1'] }}
      </template>
      <template #editor='{data }'>
        <InputNumber
          v-model="data.score['scoreOfWeek1']"
          autofocus
          class='excel-input p-inputtext-sm w-full'
          :max='10'
          :max-fraction-digits='3'
          :min='0'
          :min-fraction-digits='0'
          mode='decimal'/>
      </template>
    </Column>
    <Column
      class='text-center'>
      <template #body='{ data }'>
        {{ data.score['scoreOfWeek2'] }}
      </template>
      <template #editor='{data}'>
        <InputNumber
          v-model="data.score['scoreOfWeek2']"
          autofocus
          class='excel-input p-inputtext-sm w-full'
          :max='10'
          :max-fraction-digits='3'
          :min='0'
          :min-fraction-digits='0'
          mode='decimal'/>
      </template>
    </Column>
    <Column
      class='text-center'>
      <template #body='{ data }'>
        {{ data.score['scoreOfWeek3'] }}
      </template>
      <template #editor='{data}'>
        <InputNumber
          v-model="data.score['scoreOfWeek3']"
          autofocus
          class='excel-input p-inputtext-sm w-full'
          :max='10'
          :max-fraction-digits='3'
          :min='0'
          :min-fraction-digits='0'
          mode='decimal'/>
      </template>
    </Column>
    <Column
      class='text-center'>
      <template #body='{ data }'>
        {{ data.score['scoreOfWeek4'] }}
      </template>
      <template #editor='{data}'>
        <InputNumber
          v-model="data.score['scoreOfWeek4']"
          autofocus
          class='excel-input p-inputtext-sm w-full'
          :max='10'
          :max-fraction-digits='3'
          :min='0'
          :min-fraction-digits='0'
          mode='decimal'/>
      </template>
    </Column>
    <Column class='text-center'>
      <template #body='{ data }'>
        {{ computeMonthAvg(data.score) }}
      </template>
    </Column>
    <Column
      class='text-center'>
      <template #body='{ data }'>
        {{ computeRounded(data.score) }}
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import type { ColumnState } from 'primevue/column';
import type { Ref } from 'vue';
import { inject, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveEvaluateEmployeeScoreInReport } from '@/apps/hrm/api/graphql/evaluate';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';

import type { EmployeePointDetail, EvaluateReportDetail } from '../../../model/evaluate';
const props = defineProps({
  employees: {
    type: Array as PropType<EmployeePointDetail[]>,
    default: [] as EmployeePointDetail[],
  }
});

const selectedReport = inject('selectedReport') as Ref<EvaluateReportDetail | null>;
const handleViewDetail = inject('handleViewDetail') as (id: string) => void;
const isRefresh = inject('isRefresh', ref(0));
type SaveHandlerRegister = (fn: () => void) => void;
const registerSaveHandler = inject<SaveHandlerRegister>('registerSaveHandler');
const activeTab = inject<Ref<'MY_DEPT' | 'WAITING' | 'SUMMARY'>>('activeTab', ref<'MY_DEPT' | 'WAITING' | 'SUMMARY'>('MY_DEPT'));

const { mutate, onDone, onError } = saveEvaluateEmployeeScoreInReport();

const localEmployees = ref<EmployeePointDetail[]>(cloneDeep(props.employees));
watch(() => props.employees, (newVal) => {
  localEmployees.value = cloneDeep(newVal).filter((item) => item.selectedEmployee).map(emp => ({
    ...emp,
    score: emp.score ?? {
      'scoreOfWeek1': null,
      'scoreOfWeek2': null,
      'scoreOfWeek3': null,
      'scoreOfWeek4': null
    }
  }));
}, {
  immediate: true,
  deep: true
}
);

const { t } = useI18n();
const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });

function computeMonthAvg(score: Record<string, number>): number | null {
  const weeks = ['scoreOfWeek1', 'scoreOfWeek2', 'scoreOfWeek3', 'scoreOfWeek4'];
  const values = weeks.map(key => score[key]).filter(v => v != null);
  if (values.length === 0) {
    return null;
  }
  const total = values.reduce((sum, v) => sum + v, 0);
  const avg = total / values.length;
  return Number.isInteger(avg) ? avg : Math.floor(avg * 100) / 100;
}

function computeRounded(score: Record<string, number>): number | null {
  const avg = computeMonthAvg(score);
  if (avg == null) {
    return null;
  }
  const floor = Math.floor(avg);
  const decimal = avg - floor;
  if (decimal < 0.25) {
    return floor;
  } else if (decimal <= 0.5) {
    return floor + 0.5;
  } else {
    return floor + 1;
  }
}

function onSaveListReport(){
  const payload = {
    reportId: selectedReport.value?.report.id,
    employees: localEmployees.value.map(emp => {
      const monthAvg = computeMonthAvg(emp.score);
      const rounded = computeRounded(emp.score);
      return {
        employeeId: emp.employeeId,
        score: {
          ...emp.score,
          'averageScoreOfMonthByWeek': monthAvg,
          'roundedScoreOfMonthByWeek': rounded
        }
      };
      
    })
  };
  mutate({ input: payload });
}

onDone(() => {
  toastSuccess({ message: t('Lưu bảng đánh giá thành công') });
  if(selectedReport.value?.report.id){
    handleViewDetail(selectedReport.value?.report.id);
  }
  isRefresh.value++;
});

onError(() => {
  toastError();
});

onMounted(() => {
  registerSaveHandler?.(onSaveListReport);
});

</script>

<style scoped>
:deep(.excel-input .p-inputtext) {
  border: none;
  box-shadow: none;
  outline: none;
  border-radius: 0;
  padding: 0;
  text-align: center;
  font-size: 14px;
  width: 100%;
  height: 100%;
}

:deep(.p-cell-editing) {
  border: 2px solid #217346;
  background-color: var(--surface-overlay);
  padding: 0;
}
</style>