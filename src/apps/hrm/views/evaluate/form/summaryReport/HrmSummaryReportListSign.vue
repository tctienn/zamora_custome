<template>
  <div
    ref='listSignRef'
    class='flex gap-2 justify-content-between mb-2'>
    <p class='font-bold title'>{{ t('hrm.evaluate.titleListSigned')}}</p> 
    <Button
      class='btn-create focus:shadow-none font-medium p-2'
      icon='pi pi-plus'
      @click='showFormCreate = true'></Button>
  </div>
  <DataTable
    class='p-datatable-gridlines p-datatable-sm w-full'
    edit-mode='cell'
    table-style='table-layout: fixed'
    :value='listSignature'
    @cell-edit-complete='onCellEditComplete'>
    <Column
      class='px-2 py-2 text-center'
      field='orderNumber'
     
      header='STT'
      row-reorder 
      style='width: 8%'>
      <template #body='{ data }'>
        {{ data.orderNumber }}
      </template>
      <template #editor='{ data, field }'>
        <InputNumber
          v-model='data[field]'
          class='excel-input w-full' />
      </template>
    </Column>
    <Column
      class='w-30rem'
      field='titleOfSignatoryName'
      :header='t("Tên")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #editor='{ data, field }'>
        <InputText
          v-model='data[field]'
          class='excel-input w-full' />
      </template>
    </Column>
    <Column
      class='text-center w-3rem'
      header=''>
      <template #body='{ data }'>
        <Checkbox
          v-model='data.isActive'
          binary/>
      </template>
    </Column>
  </DataTable>
  <HrmSummaryReportSign
    v-if='showFormCreate'
    :id = 'id'
    v-model:visible ='showFormCreate'
    @submit='onAddedSignature'/>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import type { DataTableCellEditCompleteEvent } from 'primevue/datatable';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllTitleOfSignatureOfTheSummaryReport, saveTitleOfSignatory } from '@/apps/hrm/api/graphql/evaluate';
import type { SignatureSummaryReport } from '@/apps/hrm/model/evaluate';

import HrmSummaryReportSign from '../../modal/HrmSummaryReportSign.vue';

const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
});

const { t } = useI18n();
const listSignature = ref<SignatureSummaryReport[]>([]);
const showFormCreate = ref(false);
const { mutate: saveSignatory } = saveTitleOfSignatory();

function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  const { data, newValue, field } = event;
  data[field] = newValue;
  if (field === 'orderNumber') {
    listSignature.value = [...listSignature.value].sort(
      (a: SignatureSummaryReport, b: SignatureSummaryReport) =>
        (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
    );
  }
}

function onAddedSignature(newSignature: SignatureSummaryReport) {
  listSignature.value = [...listSignature.value, newSignature].sort(
    (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
  );;
}

function fetchData(evaluateSummaryReportId: string) {
  getAllTitleOfSignatureOfTheSummaryReport(evaluateSummaryReportId).onResult((res) => {
    const value = res.data.getAllTitleOfSignatureOfTheSummaryReport;
    if(value){
      listSignature.value = cloneDeep(value).sort(
        (a: SignatureSummaryReport, b: SignatureSummaryReport) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
      ) as SignatureSummaryReport[];
    }
  });
}

watch(() => props.id, (newId) => {
  if (newId) {
    fetchData(newId);
  }
}, { immediate: true });

function submitSign() {
  listSignature.value.forEach((s) => {
    const payload: SignatureSummaryReport = {
      titleOfSignatoryName: s.titleOfSignatoryName,
      evaluateSummaryReportId: props.id,
      orderNumber: s.orderNumber,
      isActive: s.isActive,
    };

    if (s.titleOfSignatoryId) {
      payload.titleOfSignatoryId = s.titleOfSignatoryId;
    }
    saveSignatory({ saveTitleOfSignatoryInput: payload });
  });
}

defineExpose({ submitSign });

</script>

<style scoped>
.title{
  color: #0F6CBD;
}

:deep(.excel-input) {
  border: none;
  box-shadow: none;
  outline: none;
  border-radius: 0;
  padding: 0 7px;
  font-size: 14px;
  width: 100%;
  height: 100%;
}

:deep(.excel-input .p-inputtext) {
  border: none;
  box-shadow: none;
  outline: none;
  border-radius: 0;
  text-align: center;
  padding: 0 7px;
  font-size: 14px;
  width: 100%;
  height: 100%;
}

:deep(.p-cell-editing) {
  border: 2px solid #217346;
  padding: 0;
}
</style>
