<template>
  <div
    class='formgrid grid'>
    <input
      v-model='modelReactive.id'
      hidden
      name='salaryAdjustmentDecision.id'/>
    <FormInputText
      v-model='modelReactive.salaryScaleOld'
      class='col-3'
      disabled
      :label="t('hrm.contract.salary.scale')"
      name='salaryAdjustmentDecision.salaryScaleOld'/>
    <FormInputDropdown
      v-model='modelReactive.salaryGradeOld'
      class='col-3'
      disabled
      :label='t("hrm.contract.salary.grade")'
      name='salaryAdjustmentDecision.salaryGradeOld'
      :options='grades'/>
    <FormInputNumber
      v-model='modelReactive.salaryCoefficientOld'
      class='col-3'
      disabled
      :label='t("hrm.contract.salary.coefficient")'
      :min-fraction-digits='1'
      name='salaryAdjustmentDecision.salaryCoefficientOld'/>
    <FormInputDropdown
      v-model='modelReactive.salaryLevelOld'
      class='col-3'
      disabled
      :label='t("hrm.contract.salary.coefficientSalary")'
      name='salaryAdjustmentDecision.salaryLevelOld'
      :options='coefficientSalaries'/>
    <FormInputNumber
      v-model='modelReactive.regionalMinimumWageOld'
      class='col-3'
      disabled
      :label='t("hrm.contract.salary.regionalMinimum")'
      name='salaryAdjustmentDecision.regionalMinimumWageOld'/>

    <input
      v-model='modelReactive.salaryScaleOld'
      hidden
      name='salaryAdjustmentDecision.salaryScaleOld'/>

    <input
      v-model='modelReactive.salaryCoefficientOld'
      hidden
      name='salaryAdjustmentDecision.salaryCoefficientOld'/>

    <input
      v-model='modelReactive.regionalMinimumWageOld'
      hidden
      name='salaryAdjustmentDecision.regionalMinimumWageOld'/>
  </div>
</template>

<script lang='ts' setup>
import { clone } from 'lodash';
import { onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import { type DecisionSalary } from '@/apps/hrm/model/contract';

const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<DecisionSalary>,
  default: {} as DecisionSalary
});

const modelReactive = reactive(clone(model.value) || {} as DecisionSalary);

watch(model, (value) => {
  if (value) {
    Object.assign(modelReactive, value);
  } else {
    Object.assign(modelReactive, {} as DecisionSalary);
  }
});

const scales = ref([]);
const grades = ref([]);
const coefficientSalaries = ref([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY_GRADE, grades);
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY_STEP, scales);
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY, coefficientSalaries);
});
</script>

<style scoped>

</style>
