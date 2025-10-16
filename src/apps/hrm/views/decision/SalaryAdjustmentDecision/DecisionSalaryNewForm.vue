<template>
  <div
    class='formgrid grid'>
    <FormInputText
      v-model='modelReactive.salaryScaleNew'
      class='col-3'
      :label="t('hrm.contract.salary.scale')"
      name='salaryAdjustmentDecision.salaryScaleNew'/>
    <FormInputDropdown
      v-model='modelReactive.salaryGradeNew'
      class='col-3'
      :label='t("hrm.contract.salary.grade")'
      name='salaryAdjustmentDecision.salaryGradeNew'
      :options='grades'/>
    <FormInputNumber
      v-model='modelReactive.salaryCoefficientNew'
      class='col-3'
      :label='t("hrm.contract.salary.coefficient")'
      :min-fraction-digits='1'
      name='salaryAdjustmentDecision.salaryCoefficientNew'/>
    <FormInputDropdown
      v-model='modelReactive.salaryLevelNew'
      class='col-3'
      :label='t("hrm.contract.salary.coefficientSalary")'
      name='salaryAdjustmentDecision.salaryLevelNew'
      :options='coefficientSalaries'/>
    <FormInputNumber
      v-model='modelReactive.regionalMinimumWageNew'
      class='col-3'
      :label='t("hrm.contract.salary.regionalMinimum")'
      name='salaryAdjustmentDecision.regionalMinimumWageNew'/>

    <div class='align-items-center col-9 field flex gap-3 justify-content-center'>
      <div class='align-items-center flex gap-2 mt-4'>
        <div class='font-bold'>Tự động cập nhật vào quá trình diễn biến lương</div>
        <InputSwitch
          v-model='modelReactive.isAutoUpdateProcessSalary'
          name='salaryAdjustmentDecision.isAutoUpdateProcessSalary'/>

        <input
          v-model='modelReactive.isAutoUpdateProcessSalary'
          hidden
          name='salaryAdjustmentDecision.isAutoUpdateProcessSalary'>
      </div>
    </div>
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
