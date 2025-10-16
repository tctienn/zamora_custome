<template>
  <div class='formgrid grid'>
    <FormInputCalendar
      v-model='modelReactive.recruitmentDate'
      class='col-3'
      :label="t('hrm.profile.recruitment.recruitmentDate')"
      name='recruitment.recruitmentDate'/>
    <FormInputDropdown
      v-model='modelReactive.recruitmentForm'
      class='col-3'
      :label="t('hrm.profile.recruitment.recruitmentForm')"
      name='recruitment.recruitmentForm'
      option-label='label'
      option-value='value'
      :options='recruitmentFormOptions'/>
    <FormInputText
      v-model='modelReactive.recruitmentPosition'
      class='col-6'
      :label="t('hrm.profile.recruitment.recruitmentPosition')"
      name='recruitment.recruitmentPosition'/>
    <FormInputText
      v-model='modelReactive.jobBeforeRecruitment'
      class='col-6'
      :label="t('hrm.profile.recruitment.jobBeforeRecruitment')"
      name='recruitment.jobBeforeRecruitment'/>
    <FormInputText
      v-model='modelReactive.recruitmentAgency'
      class='col-6'
      :label="t('hrm.profile.recruitment.recruitmentAgency')"
      name='recruitment.recruitmentAgency'/>
    <FormInputText
      v-model='modelReactive.note'
      class='col-6'
      :label="t('hrm.profile.recruitment.note')"
      name='recruitment.note'/>
    <FormInputCheckbox
      v-model='modelReactive.isOldStaff'
      class='col-3'
      :label="t('hrm.profile.recruitment.isOldStaff')"
      name='recruitment.isOldStaff'/>
  </div>
</template>

<script lang='ts' setup>
import { camelCase } from 'lodash';
import { type PropType, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputCheckbox from '@/apps/hrm/components/form/FormInputCheckbox.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { correctModel } from '@/apps/hrm/helpers/utils';
import { type EmployeeRecruitment, RecruitmentForm } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const model = defineModel({ type: Object as PropType<EmployeeRecruitment> });

const modelReactive = reactive<EmployeeRecruitment>(correctModel(model.value || {}));
watch(model, (value) => {
  Object.assign(modelReactive, correctModel(value || {}));
});
const recruitmentFormOptions = Object.entries(RecruitmentForm).map(([key, value]) => ({
  label: value,
  value: value
}));
</script>

<style scoped></style>
