<template>
  <div class='grid'>
    <Card
      v-if='model'
      class='col-12 pl-0'>
      <template #title>{{ t('hrm.contract.salary.title') }}</template>
      <template #content>
        <div class='grid pl-3'>
          <InfoRow
            :label="t('hrm.contract.salary.type')"
            :value="model.type ? getSalaryTypeLabel(model.type) : '-'"/>

          <template v-if='model.type === ContractSalaryType.COEFFICIENT'>
            <InfoRow
              :label="t('hrm.contract.salary.scale')"
              :value='model.scale'/>
            <InfoRow
              :label="t('hrm.contract.salary.grade')"
              :value='model.grade'/>
            <InfoRow
              :label="t('hrm.contract.salary.coefficient')"
              :value='model.coefficient?.toString() || ""'/>
            <InfoRow
              :label="t('hrm.contract.salary.coefficientSalary')"
              :value=' model.coefficientSalary'/>
            <InfoRow
              :label="t('hrm.contract.salary.regionalMinimum')"
              :value='model.regionalMinimum?.toString() || ""'/>
          </template>

          <template v-else-if='model.type === ContractSalaryType.AGREEMENT'>
            <InfoRow
              :label="t('hrm.contract.salary.agreementSalary')"
              :value='model.agreementSalary?.toString() || ""'/>
          </template>

          <InfoRow
            :label="t('hrm.contract.salary.jobTitle')"
            :value='getLabel(jobTitles, model.jobTitle)'/>
          <InfoRow
            :label="t('hrm.contract.salary.rank')"
            :value='model.rank'/>
          <InfoRow
            class='col-6'
            :label="t('hrm.contract.salary.totalSalary')"
            :value='formatSalary(model.totalSalary?.toString() || "")'/>
        </div>

        <div class='mt-3'>
          <HrmContractSalaryBonusView :bonuses='model.bonuses || []'/>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang='ts' setup>
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import { type ContractSalary, ContractSalaryType } from '@/apps/hrm/model/contract';

import HrmContractSalaryBonusView from './HrmContractSalaryBonusView.vue';
import InfoRow from './InfoRow.vue';

const props = defineProps({
  model: {
    type: Object as PropType<ContractSalary>,
    default: {} as ContractSalary
  }
});

const { t } = useI18n();

const scales = ref<any[]>([]);
const grades = ref<any[]>([]);
const ranks = ref<any[]>([]);
const coefficientSalaries = ref<any[]>([]);
const jobTitles = ref<any[]>([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY_GRADE, grades);
  fetchCategoryMappingName(CATEGORY_TYPE.LEVEL, ranks);
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY_STEP, scales);
  fetchCategoryMappingName(CATEGORY_TYPE.SALARY, coefficientSalaries);
  // Giả sử jobTitles là danh sách đơn giản
  jobTitles.value = ['Chuyên viên', 'Phụ cấp chức danh'].map((name) => ({ name }));
});

function getLabel(options: any[], value: any, labelField = 'name') {
  return options?.find((o) => o?.id === value || o?.key === value || o?.name === value)?.[labelField] || '';
}

function getSalaryTypeLabel(type: ContractSalaryType) {
  const key = Object.keys(ContractSalaryType).find(k => ContractSalaryType[k as keyof typeof ContractSalaryType] === type);
  return key ? t(`hrm.contract.salary.typeOptions.${key.toLowerCase()}`) : '';
}

const formatSalary = (salary: string | number) => {
  if (!salary) {
    return '';
  }
  const numeric = typeof salary === 'string' ? parseFloat(salary) : salary;
  if (isNaN(numeric)) {
    return salary.toString();
  }
  return numeric.toLocaleString('vi-VN'); // ví dụ: "1.000.000"
};

</script>

<style scoped>
:deep(.p-card) {
  box-shadow: none;
}

:deep(.p-card-body) {
  padding-bottom: 0;
}
</style>
