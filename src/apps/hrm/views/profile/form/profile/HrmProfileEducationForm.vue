<template>
  <div class='formgrid grid'>
    <FormInputDropdown
      v-model='modelValue.generalLevel'
      class='col-3'
      :label="t('hrm.profile.education.generalLevel')"
      name='education.generalLevel'
      :options='culturalLevels'/>
    <FormInputDropdown
      v-model='modelValue.highestLevel'
      class='col-3'
      :label="t('hrm.profile.education.highestLevel')"
      name='education.highestLevel'
      :options='educationLevels'/>
    <FormInputDropdown
      v-model='modelValue.stateManagement'
      class='col-6'
      :label="t('hrm.profile.education.stateManagement')"
      name='education.stateManagement'
      :options='stateManagements'/>
    <FormInputDropdown
      v-model='modelValue.professionalLevel'
      class='col-6'
      :label="t('hrm.profile.education.specializedJob')"
      name='education.professionalLevel'
      :options='specializedJobs'/>
    <FormInputDropdown
      v-model='modelValue.politicalTheory'
      class='col-6'
      :label="t('hrm.profile.education.politicalTheory')"
      name='education.politicalTheory'
      :options='politicalTheories'/>
    <FormInputDropdown
      v-model='modelValue.trainingType'
      class='col-6'
      :label="t('hrm.profile.education.trainingType')"
      name='education.trainingType'
      :options='trainingForms'/>
    <FormInputDropdown
      v-model='modelValue.foreignLanguageLevel'
      class='col-3'
      :label="t('hrm.profile.education.foreignLanguageLevel')"
      name='education.foreignLanguageLevel'
      :options='foreignLanguageLevels'/>
    <FormInputDropdown
      v-model='modelValue.informationTechnologyLevel'
      class='col-3'
      :label="t('hrm.profile.education.informationTechnologyLevel')"
      name='education.informationTechnologyLevel'
      :options='itLevels'/>
    <FormInputDropdown
      v-model='modelValue.specialized'
      class='col-6'
      :label="t('hrm.profile.education.specialized')"
      name='education.specialized'
      :options='majors'/>
    <FormInputNumber
      v-model='modelValue.yearsOfExperience'
      class='col-3'
      :label='t("hrm.profile.education.yearsOfExperience")'
      name='education.yearsOfExperience'/>
    <FormInputDropdown
      v-model='modelValue.currentPosition'
      class='col-3'
      :label="t('hrm.profile.education.currentPosition')"
      name='education.currentPosition'
      :options='jobPositions'/>
  </div>
</template>

<script lang='ts' setup>
import { onMounted, type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { correctModel, fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import type { EmployeeEducation } from '@/apps/hrm/model/employee';

const { t } = useI18n();

const model = defineModel({ type: Object as PropType<EmployeeEducation> });
const modelValue = reactive<EmployeeEducation>(correctModel(model.value || {}));

const culturalLevels = ref([]);
const educationLevels = ref([]);
const stateManagements = ref([]);
const specializedJobs = ref([]);
const politicalTheories = ref([]);
const trainingForms = ref([]);
const foreignLanguageLevels = ref([]);
const itLevels = ref([]);
const majors = ref([]);
const jobPositions = ref([]);

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.CULTURAL_LEVEL, culturalLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.EDUCATION_LEVEL, educationLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.STATE_MANAGEMENT, stateManagements);
  fetchCategoryMappingName(CATEGORY_TYPE.SPECIALIZED_JOB, specializedJobs);
  fetchCategoryMappingName(CATEGORY_TYPE.POLITICAL_THEORY, politicalTheories);
  fetchCategoryMappingName(CATEGORY_TYPE.TRAINING_FORM, trainingForms);
  fetchCategoryMappingName(CATEGORY_TYPE.FOREIGN_LANGUAGE_LEVEL, foreignLanguageLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.IT_LEVEL, itLevels);
  fetchCategoryMappingName(CATEGORY_TYPE.MAJOR, majors);
  fetchCategoryMappingName(CATEGORY_TYPE.JOB_POSITION, jobPositions);
});

</script>

<style scoped>

</style>
