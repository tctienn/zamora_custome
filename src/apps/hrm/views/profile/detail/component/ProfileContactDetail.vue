<template>
  <div class='formgrid grid'>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.phoneNumber")'
      :value='model.phoneNumber'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.personToReport")'
      :value='model.personToReport'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.landline")'
      :value='model.landline'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.relationship")'
      :value='model.relationship'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.email")'
      :value='model.email'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.phonePersonToReport")'
      :value='model.phonePersonToReport'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.emailIssuingUnit")'
      :value='model.emailIssuingUnit'/>
    <LabelDisplay
      class='col-6'
      :label='t("hrm.profile.contact.addressPersonToReport")'
      :value='model.addressPersonToReport'/>
    <LabelDisplay
      class='col-12'
      :label='t("hrm.profile.contact.currentAddress")'
      :value='[model.currentAddress, model.currentResidence].filter(Boolean).join(", ")'/>
    <LabelDisplay
      class='col-12'
      :label='t("hrm.profile.contact.zamoraId")'
      :value='model.zamoraId'/>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeContact } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<EmployeeContact>,
  default: {} as EmployeeContact
});
</script>

<style scoped>

</style>