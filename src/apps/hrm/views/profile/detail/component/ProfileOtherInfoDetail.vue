<template>
  <div class='formgrid grid'>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'familyBackground') }"
      :label='t("hrm.profile.other.familyBackground")'
      :value='model.familyBackground'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'familySalary') }"
      :label='t("hrm.profile.other.familySalary")'
      :value='model.familySalary?.toString()'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'otherSourcesIncome') }"
      :label='t("hrm.profile.other.otherSourcesIncome")'
      :value='model.otherSourcesIncome'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'longestJobHeld') }"
      :label='t("hrm.profile.other.longestJobHeld")'
      :value='model.longestJobHeld'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'houseProvided') }"
      :label='t("hrm.profile.other.houseProvided")'
      :value='model.houseProvided'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'usableArea') }"
      :label='t("hrm.profile.other.usableArea")'
      :value='model.usableArea?.toString()'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'workExpertise') }"
      :label='t("hrm.profile.other.workExpertise")'
      :value='model.workExpertise'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'selfPurchasedHouse') }"
      :label='t("hrm.profile.other.selfPurchasedHouse")'
      :value='model.selfPurchasedHouse'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'areaHousePurchased') }"
      :label='t("hrm.profile.other.areaHousePurchased")'
      :value='model.areaHousePurchased?.toString()'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'highestHonoraryTitle') }"
      :label='t("hrm.profile.other.highestHonoraryTitle")'
      :value='model.highestHonoraryTitle'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'areaLandGranted') }"
      :label='t("hrm.profile.other.areaLandGranted")'
      :value='model.areaLandGranted?.toString()'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'selfPurchasedLandArea') }"
      :label='t("hrm.profile.other.selfPurchasedLandArea")'
      :value='model.selfPurchasedLandArea?.toString()'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'clearlyDeclare') }"
      :label='t("hrm.profile.other.clearlyDeclare")'
      :value='model.clearlyDeclare'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'relativesAbroad') }"
      :label='t("hrm.profile.other.relativesAbroad")'
      :value='model.relativesAbroad'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'haveRelations') }"
      :label='t("hrm.profile.other.haveRelations")'
      :value='model.haveRelations'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'review') }"
      :label='t("hrm.profile.other.review")'
      :value='model.review'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeOtherInfo } from '@/apps/hrm/model/employee';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const { t } = useI18n();
const hrmStore = useHrmProfileStore();
const { changedProperties } = storeToRefs(hrmStore);
const changedPropertiesValue = computed(() => changedProperties.value);
const model = defineModel({
  type: Object as PropType<EmployeeOtherInfo>,
  default: {} as EmployeeOtherInfo
});

</script>

<style scoped>

</style>