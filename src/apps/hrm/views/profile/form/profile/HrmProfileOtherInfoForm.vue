<template>
  <div class='formgrid grid'>
    <FormInputText
      v-model='modelReactive.familyBackground'
      class='col-6'
      :label="t('hrm.profile.other.familyBackground')"
      name='otherInfo.familyBackground'/>
    <FormInputNumber
      v-model='modelReactive.familySalary'
      class='col-3'
      :label="t('hrm.profile.other.familySalary')"
      name='otherInfo.familySalary'/>
    <FormInputNumber
      v-model='modelReactive.otherSourcesIncome'
      class='col-3'
      :label="t('hrm.profile.other.otherSourcesIncome')"
      name='otherInfo.otherSourcesIncome'/>
    <FormInputText
      v-model='modelReactive.longestJobHeld'
      class='col-6'
      :label="t('hrm.profile.other.longestJobHeld')"
      name='otherInfo.longestJobHeld'/>
    <FormInputText
      v-model='modelReactive.houseProvided'
      class='col-3'
      :label="t('hrm.profile.other.houseProvided')"
      name='otherInfo.houseProvided'/>
    <FormInputNumber
      v-model='modelReactive.usableArea'
      class='col-3'
      :label="t('hrm.profile.other.usableArea')"
      name='otherInfo.usableArea'/>
    <FormInputText
      v-model='modelReactive.workExpertise'
      class='col-6'
      :label="t('hrm.profile.other.workExpertise')"
      name='otherInfo.workExpertise'/>
    <FormInputText
      v-model='modelReactive.selfPurchasedHouse'
      class='col-3'
      :label="t('hrm.profile.other.selfPurchasedHouse')"
      name='otherInfo.selfPurchasedHouse'/>
    <FormInputNumber
      v-model='modelReactive.areaHousePurchased'
      class='col-3'
      :label="t('hrm.profile.other.areaHousePurchased')"
      name='otherInfo.areaHousePurchased'/>
    <FormInputText
      v-model='modelReactive.highestHonoraryTitle'
      class='col-6'
      :label="t('hrm.profile.other.highestHonoraryTitle')"
      name='otherInfo.highestHonoraryTitle'/>
    <FormInputNumber
      v-model='modelReactive.areaLandGranted'
      class='col-3'
      :label="t('hrm.profile.other.areaLandGranted')"
      name='otherInfo.areaLandGranted'/>
    <FormInputNumber
      v-model='modelReactive.selfPurchasedLandArea'
      class='col-3'
      :label="t('hrm.profile.other.selfPurchasedLandArea')"
      name='otherInfo.selfPurchasedLandArea'/>
    <FormInputText
      v-model='modelReactive.clearlyDeclare'
      class='col-6'
      :label="t('hrm.profile.other.clearlyDeclare')"
      name='otherInfo.clearlyDeclare'/>
    <FormInputText
      v-model='modelReactive.relativesAbroad'
      class='col-6'
      :label="t('hrm.profile.other.relativesAbroad')"
      name='otherInfo.relativesAbroad'/>
    <FormInputText
      v-model='modelReactive.haveRelations'
      class='col-6'
      :label="t('hrm.profile.other.haveRelations')"
      name='otherInfo.haveRelations'/>
    <FormInputText
      v-model='modelReactive.review'
      class='col-6'
      :label="t('hrm.profile.other.review')"
      name='otherInfo.review'/>
  </div>
</template>

<script setup lang='ts'>
import { type PropType, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputNumber from '@/apps/hrm/components/form/FormInputNumber.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { correctModel } from '@/apps/hrm/helpers/utils';
import type { EmployeeOtherInfo } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const model = defineModel({ type: Object as PropType<EmployeeOtherInfo> });
const modelReactive = reactive<EmployeeOtherInfo>(correctModel(model.value || {}));

watch(model, (value) => {
  Object.assign(modelReactive, correctModel(value || {}));
});
</script>

<style scoped></style>
