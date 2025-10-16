<template>
  <form ref='formRef'>
    <HrmSummaryReportGeneralForm v-model='model'/>
    <HrmSummaryReportListOrganization v-model:listOrganization='model.listOfEvaluateEmployeeReportOnEachOrganization'/>
    <div class='mt-3'> 
      <HrmSummaryReportCommentForm v-model='model'/>
    </div>
    <div v-if='model.evaluateSummaryReportId'> 
      <HrmSummaryReportListSign
        :id='model.evaluateSummaryReportId'
        ref='listSignRef'/>
    </div>
  </form>
</template>

<script lang='ts' setup>

import { type PropType, ref } from 'vue';

import type { SummaryReport } from '@/apps/hrm/model/evaluate';

import HrmSummaryReportCommentForm from './HrmSummaryReportCommentForm.vue';
import HrmSummaryReportGeneralForm from './HrmSummaryReportGeneralForm.vue';
import HrmSummaryReportListOrganization from './HrmSummaryReportListOrganization.vue';
import HrmSummaryReportListSign from './HrmSummaryReportListSign.vue';
const model = defineModel({
  type: Object as PropType<SummaryReport>,
  default: {} as SummaryReport,
});
const formRef = ref<HTMLFormElement>();
const listSignRef = ref<InstanceType<typeof HrmSummaryReportListSign>>();

function submitForm() {
  return Promise.resolve(model.value);
}

function submitSign() {
  return listSignRef.value?.submitSign();
}

defineExpose({
  submitForm,
  submitSign 
});
</script>

<style scoped>

</style>
