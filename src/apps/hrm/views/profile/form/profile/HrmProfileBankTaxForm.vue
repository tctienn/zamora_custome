<template>
  <div class='formgrid grid'>
    <FormInputText
      v-model='modelReactive.accountNumber'
      class='col-3'
      :label="t('hrm.profile.bankTax.accountNumber')"
      name='bankTax.accountNumber'/>
    <FormInputText
      v-model='modelReactive.accountName'
      class='col-3'
      :label="t('hrm.profile.bankTax.accountName')"
      name='bankTax.accountName'/>
    <FormInputText
      v-model='modelReactive.personalTaxCode'
      class='col-3'
      :label="t('hrm.profile.bankTax.personalTaxCode')"
      name='bankTax.personalTaxCode'/>
    <FormInputText
      v-model='modelReactive.codeSynchronizedTax'
      class='col-3'
      :label="t('hrm.profile.bankTax.codeSynchronizedTax')"
      name='bankTax.codeSynchronizedTax'/>
    <FormInputDropdown
      v-model='modelReactive.bank'
      class='col-6'
      :label="t('hrm.profile.bankTax.bank')"
      name='bankTax.bank'
      :options='banks'/>
    <FormInputText
      v-model='modelReactive.bankBranch'
      class='col-6'
      :label="t('hrm.profile.bankTax.bankBranch')"
      name='bankTax.bankBranch'/>
  </div>
</template>

<script lang='ts' setup>
import { onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { correctModel, fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import type { EmployeeBankTax } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const model = defineModel({ type: Object as PropType<EmployeeBankTax> });
const modelReactive = reactive<EmployeeBankTax>(correctModel(model.value || {}));

watch(model, (value) => {
  Object.assign(modelReactive, correctModel(value || {}));
});

const banks = ref([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.BANK, banks);
});
</script>

<style scoped></style>
