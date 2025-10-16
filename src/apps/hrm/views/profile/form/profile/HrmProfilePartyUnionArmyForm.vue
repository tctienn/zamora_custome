<template>
  <div class='formgrid grid'>
    <FormInputText
      v-model='modelReactive.partyCardNumber'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.partyCardNumber')"
      name='partyUnionArmy.partyCardNumber'/>
    <FormInputCalendar
      v-model='modelReactive.partyEntryDay'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.partyEntryDay')"
      name='partyUnionArmy.partyEntryDay'/>
    <FormInputText
      v-model='modelReactive.unionCardNumber'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.unionCardNumber')"
      name='partyUnionArmy.unionCardNumber'/>
    <FormInputCalendar
      v-model='modelReactive.unionEntryDay'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.unionEntryDay')"
      name='partyUnionArmy.unionEntryDay'/>
    <FormInputCalendar
      v-model='modelReactive.partyEntryDayOfficial'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.partyEntryDayOfficial')"
      name='partyUnionArmy.partyEntryDayOfficial'/>
    <div class='col-3'></div>
    <FormInputText
      v-model='modelReactive.unionEntry'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.unionEntry')"
      name='partyUnionArmy.unionEntry'/>
    <FormInputText
      v-model='modelReactive.placeAdmission'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.placeAdmission')"
      name='partyUnionArmy.placeAdmission'/>
    <FormInputText
      v-model='modelReactive.unionCurrentPosition'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.unionCurrentPosition')"
      name='partyUnionArmy.unionCurrentPosition'/>
    <FormInputText
      v-model='modelReactive.partyCellActivities'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.partyCellActivities')"
      name='partyUnionArmy.partyCellActivities'/>
    <FormInputCalendar
      v-model='modelReactive.dayJoiningRevolution'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.dayJoiningRevolution')"
      name='partyUnionArmy.dayJoiningRevolution'/>
    <FormInputCalendar
      v-model='modelReactive.dateOrganizationParticipation'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.dateOrganizationParticipation')"
      name='partyUnionArmy.dateOrganizationParticipation'/>
    <FormInputText
      v-model='modelReactive.officialPartyCommittee'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.officialPartyCommittee')"
      name='partyUnionArmy.officialPartyCommittee'/>
    <FormInputText
      v-model='modelReactive.workInOrganization'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.workInOrganization')"
      name='partyUnionArmy.workInOrganization'/>
    <FormInputText
      v-model='modelReactive.currentPartyCommittee'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.currentPartyCommittee')"
      name='partyUnionArmy.currentPartyCommittee'/>
    <FormInputCalendar
      v-model='modelReactive.enlistmentDate'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.enlistmentDate')"
      name='partyUnionArmy.enlistmentDate'/>
    <FormInputCalendar
      v-model='modelReactive.dischargeDate'
      class='col-3'
      :label="t('hrm.profile.partyUnionArmy.dischargeDate')"
      name='partyUnionArmy.dischargeDate'/>
    <FormInputText
      v-model='modelReactive.partyCommitteeAnd'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.partyCommitteeAnd')"
      name='partyUnionArmy.partyCommitteeAnd'/>
    <FormInputText
      v-model='modelReactive.reasonDischarge'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.reasonDischarge')"
      name='partyUnionArmy.reasonDischarge'/>
    <FormInputText
      v-model='modelReactive.partyFeeCalculation'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.partyFeeCalculation')"
      name='partyUnionArmy.partyFeeCalculation'/>
    <FormInputText
      v-model='modelReactive.highestMilitaryRank'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.highestMilitaryRank')"
      name='partyUnionArmy.highestMilitaryRank'/>
    <FormInputText
      v-model='modelReactive.appellation'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.appellation')"
      name='partyUnionArmy.appellation'/>
    <FormInputText
      v-model='modelReactive.disabledClass'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.disabledClass')"
      name='partyUnionArmy.disabledClass'/>
    <FormInputText
      v-model='modelReactive.armorial'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.armorial')"
      name='partyUnionArmy.armorial'/>
    <FormInputDropdown
      v-model='modelReactive.childrenPolicyFamilies'
      class='col-6'
      :label="t('hrm.profile.partyUnionArmy.childrenPolicyFamilies')"
      name='partyUnionArmy.childrenPolicyFamilies'
      option-label='label'
      option-value='label'
      :options='yesNoOptions'/>
  </div>
</template>

<script setup lang='ts'>
import { type PropType, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FormInputCalendar from '@/apps/hrm/components/form/FormInputCalendar.vue';
import FormInputDropdown from '@/apps/hrm/components/form/FormInputDropdown.vue';
import FormInputText from '@/apps/hrm/components/form/FormInputText.vue';
import { correctModel } from '@/apps/hrm/helpers/utils';
import type { EmployeePartyUnionArmy } from '@/apps/hrm/model/employee';

const { t } = useI18n();
const model = defineModel({ type: Object as PropType<EmployeePartyUnionArmy> });
const modelReactive = reactive<EmployeePartyUnionArmy>(correctModel(model.value || {}));

const yesNoOptions = [
  { label: t('common.boolean.false') },
  { label: t('common.boolean.true') },
];

watch(model, (value) => {
  Object.assign(modelReactive, correctModel(value || {}));
});
</script>

<style scoped></style>
