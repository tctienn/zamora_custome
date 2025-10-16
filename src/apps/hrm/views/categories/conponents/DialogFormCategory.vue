<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="
      t(`vehicle.common.${code ? 'update' : 'create'}`) +
        ' ' +
        t(`hrm.category.${selectedCategory}`)
    "
    @hide="emits('hide-dialog')">
    <FormReasonCategory
      v-if='selectedCategory === CATEGORY_TYPE.REASON'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormAllowanceCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.ALLOWANCE'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormProfessionalSkillsCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.PROFESSIONAL_SKILLS'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormProfessionalSkillsCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.KPI_GROUP_CONFIG'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormSalaryCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.SALARY'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormWorkLevelCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.WORK_LEVEL'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormSocialInsuranceProvinceCodeCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.SOCIAL_INSURANCE_PROVINCE_CODE'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormContractTypeCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.CONTRACT_TYPE'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormTimekeepingSymbolsCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.TIMEKEEPING_SYMBOLS'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormShiftCategory
      v-else-if='selectedCategory === CATEGORY_TYPE.SHIFT'
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
    <FormRegularCategory
      v-else
      :code='code'
      :selected-category='selectedCategory'
      @hide-dialog='hideDialogFn'/>
  </Dialog>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import FormRegularCategory from '@/apps/hrm/views/categories/conponents/FormRegularCategory.vue';
import FormAllowanceCategory from '@/apps/hrm/views/categories/conponents/otherForm/FormAllowanceCategory.vue';
import FormContractTypeCategory from '@/apps/hrm/views/categories/conponents/otherForm/FormContractTypeCategory.vue';
import FormProfessionalSkillsCategory
  from '@/apps/hrm/views/categories/conponents/otherForm/FormProfessionalSkillsCategory.vue';
import FormReasonCategory from '@/apps/hrm/views/categories/conponents/otherForm/FormReasonCategory.vue';
import FormSalaryCategory from '@/apps/hrm/views/categories/conponents/otherForm/FormSalaryCategory.vue';
import FormShiftCategory from '@/apps/hrm/views/categories/conponents/otherForm/FormShiftCategory.vue';
import FormSocialInsuranceProvinceCodeCategory
  from '@/apps/hrm/views/categories/conponents/otherForm/FormSocialInsuranceProvinceCodeCategory.vue';
import FormTimekeepingSymbolsCategory
  from '@/apps/hrm/views/categories/conponents/otherForm/FormTimekeepingSymbolsCategory.vue';
import FormWorkLevelCategory from '@/apps/hrm/views/categories/conponents/otherForm/FormWorkLevelCategory.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  code: {
    type: String,
    default: null,
  },
  selectedCategory: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(['hide-dialog', 'reload']);

const hideDialogFn = () => {
  emits('hide-dialog');
};

const visibleForm = ref(props.visibleDialog);
const { t } = useI18n();
</script>

<style scoped></style>
