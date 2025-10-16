<template>
  <div class='formgrid grid'>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'generalLevel') }"
      :label='t("hrm.profile.education.generalLevel")'
      :value='model.generalLevel'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'stateManagement') }"
      :label='t("hrm.profile.education.stateManagement")'
      :value='model.stateManagement'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'highestLevel') }"
      :label='t("hrm.profile.education.highestLevel")'
      :value='model.highestLevel'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'politicalTheory') }"
      :label='t("hrm.profile.education.politicalTheory")'
      :value='model.politicalTheory'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'professionalLevel') }"
      :label='t("hrm.profile.education.specializedJob")'
      :value='model.professionalLevel'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'foreignLanguageLevel') }"
      :label='t("hrm.profile.education.foreignLanguageLevel")'
      :value='model.foreignLanguageLevel'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'trainingType') }"
      :label='t("hrm.profile.education.trainingType")'
      :value='model.trainingType'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'informationTechnologyLevel') }"
      :label='t("hrm.profile.education.informationTechnologyLevel")'
      :value='model.informationTechnologyLevel'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'stateManagement') }"
      :label='t("hrm.profile.education.specialized")'
      :value='model.specialized'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'yearsOfExperience') }"
      :label='t("hrm.profile.education.yearsOfExperience")'
      :value='model.yearsOfExperience?.toString()'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'currentPosition') }"
      :label='t("hrm.profile.education.currentPosition")'
      :value='model.currentPosition'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeEducation } from '@/apps/hrm/model/employee';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const model = defineModel({
  type: Object as PropType<EmployeeEducation>,
  default: {} as EmployeeEducation
});
const { t } = useI18n();
const hrmStore = useHrmProfileStore();
const { changedProperties } = storeToRefs(hrmStore);
const changedPropertiesValue = computed(() => changedProperties.value);
</script>

<style scoped>

</style>