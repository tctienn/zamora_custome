<template>
  <form ref='formRef'>
    <HrmEvaluateGeneralForm v-model='model'/>
    <HrmEmployeeInReportForm
      v-model:employees='model.employees'
      class='mt-3'
      :organization-id = 'model.reportOfOrganizationId'/>
    <div class='mt-3'> 
      <HrmEvaluateCommentForm v-model='model'/>
    </div>
  </form>
</template>

<script lang='ts' setup>

import { type PropType, ref } from 'vue';

import type { Evaluate } from '@/apps/hrm/model/evaluate';

import HrmEmployeeInReportForm from './HrmEmployeeInReportForm.vue';
import HrmEvaluateCommentForm from './HrmEvaluateCommentForm.vue';
import HrmEvaluateGeneralForm from './HrmEvaluateGeneralForm.vue';
const model = defineModel({
  type: Object as PropType<Evaluate>,
  default: {} as Evaluate,
});
const formRef = ref<HTMLFormElement>();

function submitForm() {
  return Promise.resolve(model.value);
}

defineExpose({ submitForm });
</script>

<style scoped>

</style>
