<template>
  <DataTable
    class='full-height-table h-full p-datatable-gridlines p-datatable-md'
    edit-mode='cell'
    :pt='{
      column: {
        bodyCell: bodyCellFunc
      }
    }'
    row-hover
    scroll-height='calc(100vh - 18.2rem)'
    scrollable
    show-gridlines
    :value='localEmployees'>
    <ColumnGroup type='header'>
      <Row
        v-for='(row, rowIndex) in headerConfig'
        :key='rowIndex'>
        <Column
          v-for='col in row'
          :key='col.key'
          class='text-center'
          :colspan='col.colspan || 1'
          :frozen ='col.frozen'
          :header='col.header'
          :rowspan='col.rowspan || 1'
          :style='col.style || {}'/>
      </Row>
    </ColumnGroup>
    <Column
      class='px-2 text-center'
      frozen
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
      v-for='col in columnManagerDeputyConfig'
      :key='col.key'
      :class="['text-center', col.class || '']"
      :frozen ='col.frozen'>
      <template #body='{ data }'>
        {{ data.score[col.key] ?? data[col.key]}}
      </template>

      <template
        v-if='col.editable'
        #editor='{ data }'>
        <component
          :is='resolveEditor(col)'
          v-model='data.score[col.key]'
          autofocus
          class='excel-input p-inputtext-sm w-full'
          v-bind='getEditorProps(col)'/>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import moment from 'moment';
import type { ColumnState } from 'primevue/column';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import type { Ref } from 'vue';
import { computed, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { saveEvaluateEmployeeSummaryReportScore } from '@/apps/hrm/api/graphql/evaluate';
import { columnManagerDeputyConfig, generateHeaderManagerDeputyConfig } from '@/apps/hrm/constants/generateHeaderConfig';
import {
  toastError,
  toastSuccess
} from '@/common/helpers/custom-toast-service';

import type { EvaluateReportSummaryDetail } from '../../../model/evaluate';

const props = defineProps({
  employeesSummary: {
    type: Array as any,
    default: () => []
  }
});

const selectedSummaryReport = inject(
  'selectedSummaryReport'
) as Ref<EvaluateReportSummaryDetail | null>;
const handleViewDetailSummary = inject('handleViewDetailSummary') as (id: string) => void;
const isRefresh = inject('isRefresh', ref(0));
type SaveHandlerRegister = (fn: () => void) => void;
const registerSaveHandler =
  inject<SaveHandlerRegister>('registerSaveHandler');

const { mutate, onDone, onError } =
  saveEvaluateEmployeeSummaryReportScore();
const localEmployees = ref(cloneDeep(props.employeesSummary));

const { t } = useI18n();
const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });

const prevMonth = computed(() => {
  const date = selectedSummaryReport.value?.summaryReport.monthReport;
  return date ? moment(date).subtract(1, 'month').format('MM/YYYY') : '';
});
const headerConfig = generateHeaderManagerDeputyConfig(t, prevMonth.value);
function onSaveListReport() {
  const payload = {
    reportId: selectedSummaryReport.value?.summaryReport.id,
    evaluation: [
      { employees: localEmployees.value }
    ]
  };
  mutate({ saveEvaluateEmployeeSummaryReportScoreInput: payload });
}

onDone(() => {
  toastSuccess({ message: t('Lưu bảng đánh giá thành công') });
  if (selectedSummaryReport.value?.summaryReport.id) {
    handleViewDetailSummary(selectedSummaryReport.value?.summaryReport.id);
  }
  isRefresh.value++;
});

onError(() => {
  toastError();
});

const resolveEditor = (col: { componentType: string }) => {
  switch (col.componentType) {
  case 'number': return InputNumber;
  case 'input': return InputText;
  }
};

const getEditorProps = (col: { componentType: string }) => {
  if (col.componentType === 'number') {
    return {
      min: 0,
      max: 10,
      mode: 'decimal',
      minFractionDigits: 0,
      maxFractionDigits: 3,
    };
  }
  return {};
};
onMounted(() => {
  registerSaveHandler?.(onSaveListReport);
});

</script>

<style scoped>

:deep(.excel-input) {
  border: none;
  box-shadow: none;
  outline: none;
  border-radius: 0;
  padding: 0 7px;
  text-align: center;
  font-size: 14px;
  width: 100%;
  height: 100%;
}

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
