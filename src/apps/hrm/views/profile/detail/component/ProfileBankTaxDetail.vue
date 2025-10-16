<template>
  <div class='formgrid grid'>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.bankTax.accountNumber")'
      :value='model.accountNumber'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.bankTax.bank")'
      :value='model.bank'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.bankTax.accountName")'
      :value='model.accountName'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.bankTax.bankBranch")'
      :value='model.bankBranch'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.bankTax.personalTaxCode")'
      :value='model.personalTaxCode'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.bankTax.codeSynchronizedTax")'
      :value='model.codeSynchronizedTax'/>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeBankTax } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<EmployeeBankTax>,
  default: {} as EmployeeBankTax
});
</script>

<style scoped>

</style>