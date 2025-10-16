<template>
  <div class='flex flex-wrap gap-3 mb-3'>
    <div
      v-for='(type, index) in salaryTypes'
      :key='type.value'
      class='align-items-center flex'>
      <RadioButton
        v-model='modelReactive.type'
        :input-id='`type${ index }`'
        name='salary.type'
        :value='type.value'/>
      <label
        class='ml-2'
        :for='`type${ index }`'>{{ type.label }}</label>
    </div>
  </div>
  <div
    v-if='modelReactive.type === ContractSalaryType.COEFFICIENT'
    class='formgrid grid'>
    <FormInputDropdown
      v-model='modelReactive.scale'
      class='col-3'
      :label='t("hrm.contract.salary.scale")'
      name='salary.grade'
      :options='scales'/>
    <FormInputDropdown
      v-model='modelReactive.grade'
      class='col-3'
      :label='t("hrm.contract.salary.grade")'
      name='salary.scale'
      :options='grades'/>
    <FormInputNumber
      v-model='modelReactive.coefficient'
      class='col-3'
      :label='t("hrm.contract.salary.coefficient")'
      name='salary.coefficient'/>
    <FormInputDropdown
      v-model='modelReactive.coefficientSalary'
      class='col-3'
      :label='t("hrm.contract.salary.coefficientSalary")'
      name='salary.coefficientSalary'
      :options='coefficientSalaries'/>
    <FormInputNumber
      v-model='modelReactive.regionalMinimum'
      class='col-3'
      :label='t("hrm.contract.salary.regionalMinimum")'
      name='salary.regionalMinimum'/>
  </div>
  <div
    v-if='modelReactive.type === ContractSalaryType.AGREEMENT'
    class='formgrid grid'>
    <FormInputNumber
      v-model='modelReactive.agreementSalary'
      class='col-3'
      :label='t("hrm.contract.salary.agreementSalary")'
      name='salary.agreementSalary'/>
  </div>
  <div class='formgrid grid'>
    <FormInputDropdown
      v-model='modelReactive.jobTitle'
      class='col-3'
      :label='t("hrm.contract.salary.jobTitle")'
      name='salary.jobTitle'
      :options='jobTitles'/>
    <FormInputDropdown
      v-model='modelReactive.rank'
      class='col-3'
      :label='t("hrm.contract.salary.rank")'
      name='salary.rank'
      :options='ranks'/>
    <FormInputNumber
      v-model='modelReactive.totalSalary'
      bg-highlight
      class='col-6'
      :label='t("hrm.contract.salary.totalSalary")'
      name='salary.totalSalary'/>
  </div>
  <HrmContractSalaryBonusForm :model-value='model?.bonuses || []'/>
</template>

<script lang='ts' setup>
import { clone } from 'lodash';
import { onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import { type ContractSalary, ContractSalaryType } from '@/apps/hrm/model/contract';
import HrmContractSalaryBonusForm from '@/apps/hrm/views/contract/form/HrmContractSalaryBonusForm.vue';

const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<ContractSalary>,
  default: {} as ContractSalary
});

const modelReactive = reactive(clone(model.value) || {} as ContractSalary);

watch(model, (value) => {
  if (value) {
    Object.assign(modelReactive, value);
  } else {
    Object.assign(modelReactive, {} as ContractSalary);
  }
});

const jobTitles = ['Chuyên viên', 'Phụ cấp chức danh'];
const ranks = ref([]);
const scales = ref([]);
const grades = ref([]);
const coefficientSalaries = ref([]);

const salaryTypes = Object.keys(ContractSalaryType).map((key) => ({
  label: t(`hrm.contract.salary.typeOptions.${key.toLowerCase()}`),
  value: ContractSalaryType[key as keyof typeof ContractSalaryType]
}));

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY_GRADE, grades);
  fetchCategoryMappingName(CATEGORY_TYPE.LEVEL, ranks);
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY_STEP, scales);
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY, coefficientSalaries);
});
</script>

<style scoped>

</style>
