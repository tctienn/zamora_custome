<template>
  <div class='formgrid grid'>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'partyCardNumber') }"
      :label='t("hrm.profile.partyUnionArmy.partyCardNumber")'
      :value='model.partyCardNumber'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'unionCardNumber') }"
      :label='t("hrm.profile.partyUnionArmy.unionCardNumber")'
      :value='model.unionCardNumber'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'partyEntryDay') }"
      :label='t("hrm.profile.partyUnionArmy.partyEntryDay")'
      :value='model.partyEntryDay && moment(model.partyEntryDay).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'unionEntryDay') }"
      :label='t("hrm.profile.partyUnionArmy.unionEntryDay")'
      :value='model.unionEntryDay && moment(model.unionEntryDay).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'partyEntryDayOfficial') }"
      :label='t("hrm.profile.partyUnionArmy.partyEntryDayOfficial")'
      :value='model.partyEntryDayOfficial && moment(model.partyEntryDayOfficial).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'unionEntry') }"
      :label='t("hrm.profile.partyUnionArmy.currentAddress")'
      :value='model.unionEntry'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'placeAdmission') }"
      :label='t("hrm.profile.partyUnionArmy.placeAdmission")'
      :value='model.placeAdmission'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'unionCurrentPosition') }"
      :label='t("hrm.profile.partyUnionArmy.unionCurrentPosition")'
      :value='model.unionCurrentPosition'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'partyCellActivities') }"
      :label='t("hrm.profile.partyUnionArmy.partyCellActivities")'
      :value='model.partyCellActivities'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'dayJoiningRevolution') }"
      :label='t("hrm.profile.partyUnionArmy.dayJoiningRevolution")'
      :value='model.dayJoiningRevolution && moment(model.dayJoiningRevolution).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'officialPartyCommittee') }"
      :label='t("hrm.profile.partyUnionArmy.officialPartyCommittee")'
      :value='model.officialPartyCommittee'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'dateOrganizationParticipation') }"
      :label='t("hrm.profile.partyUnionArmy.dateOrganizationParticipation")'
      :value='model.dateOrganizationParticipation && moment(model.dateOrganizationParticipation).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'currentPartyCommittee') }"
      :label='t("hrm.profile.partyUnionArmy.currentPartyCommittee")'
      :value='model.currentPartyCommittee'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'workInOrganization') }"
      :label='t("hrm.profile.partyUnionArmy.workInOrganization")'
      :value='model.workInOrganization'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'partyCommitteeAnd') }"
      :label='t("hrm.profile.partyUnionArmy.partyCommitteeAnd")'
      :value='model.partyCommitteeAnd'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'enlistmentDate') }"
      :label='t("hrm.profile.partyUnionArmy.enlistmentDate")'
      :value='model.enlistmentDate && moment(model.enlistmentDate).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'partyFeeCalculation') }"
      :label='t("hrm.profile.partyUnionArmy.partyFeeCalculation")'
      :value='model.partyFeeCalculation'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'dischargeDate') }"
      :label='t("hrm.profile.partyUnionArmy.dischargeDate")'
      :value='model.dischargeDate && moment(model.dischargeDate).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'appellation') }"
      :label='t("hrm.profile.partyUnionArmy.appellation")'
      :value='model.appellation'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'reasonDischarge') }"
      :label='t("hrm.profile.partyUnionArmy.reasonDischarge")'
      :value='model.reasonDischarge'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'armorial') }"
      :label='t("hrm.profile.partyUnionArmy.armorial")'
      :value='model.armorial'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'highestMilitaryRank') }"
      :label='t("hrm.profile.partyUnionArmy.highestMilitaryRank")'
      :value='model.highestMilitaryRank'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'disabledClass') }"
      :label='t("hrm.profile.partyUnionArmy.disabledClass")'
      :value='model.disabledClass'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'childrenPolicyFamilies') }"
      :label='t("hrm.profile.partyUnionArmy.childrenPolicyFamilies")'
      :value='model.childrenPolicyFamilies'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeePartyUnionArmy } from '@/apps/hrm/model/employee';
import useMoment from '@/common/helpers/mixins/use-moment';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const { moment } = useMoment();
const { t } = useI18n();
const hrmStore = useHrmProfileStore();
const { changedProperties } = storeToRefs(hrmStore);
const changedPropertiesValue = computed(() => changedProperties.value);
const model = defineModel({
  type: Object as PropType<EmployeePartyUnionArmy>,
  default: {} as EmployeePartyUnionArmy
});
</script>

<style scoped>

</style>