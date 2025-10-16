<template>
  <div class='formgrid grid my-3'>
    <div class='col-12 my-2'>
      <span class='font-bold'>{{ index }}. </span>
      <LabelDisplay
        :label='t("hrm.relationship.name")'
        :value='model.name'/>
    </div>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'relationship') }"
      :label='t("hrm.relationship.relationship")'
      :value='model.relationship'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'note') }"
      :label='t("hrm.relationship.note")'
      :value='model.note'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'yearBirth') }"
      :label='t("hrm.relationship.yearBirth")'
      :value='model.yearBirth?.toString()'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'phone') }"
      :label='t("hrm.relationship.phone")'
      :value='model.phone'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'cccdNumber') }"
      :label='t("hrm.relationship.cccdNumber")'
      :value='model.cccdNumber'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'dateIssueCCCD') }"
      :label='t("hrm.relationship.dateIssueCCCD")'
      :value='model.dateIssueCCCD && moment(model.dateIssueCCCD).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'placeIssueCCCD') }"
      :label='t("hrm.relationship.placeIssueCCCD")'
      :value='model.placeIssueCCCD'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'taxCode') }"
      :label='t("hrm.relationship.taxCode")'
      :value='model.taxCode'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'hometown') }"
      :label='t("hrm.relationship.hometown")'
      :value='model.hometown'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'job') }"
      :label='t("hrm.relationship.job")'
      :value='model.job'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'workUnit') }"
      :label='t("hrm.relationship.workUnit")'
      :value='model.workUnit'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'jobTitle') }"
      :label='t("hrm.relationship.jobTitle")'
      :value='model.jobTitle'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'address') }"
      :label='t("hrm.relationship.address")'
      :value='model.address'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'isDependent') }"
      :label='t("hrm.relationship.isDependent")'
      :value='model.isDependent ? t("common.yes") : t("common.no")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'isWorkSameOffice') }"
      :label='t("hrm.relationship.isWorkSameOffice")'
      :value='model.isWorkSameOffice ? t("common.yes") : t("common.no")'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { FamilyRelationshipInfo } from '@/apps/hrm/model/employee';
import useMoment from '@/common/helpers/mixins/use-moment';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

defineProps({
  index: {
    type: Number,
    default: null
  },
  model: {
    type: Object as PropType<FamilyRelationshipInfo>,
    required: true
  }
});
const { moment } = useMoment();
const { t } = useI18n();
const hrmStore = useHrmProfileStore();
const { changedProperties } = storeToRefs(hrmStore);
const changedPropertiesValue = computed(() => changedProperties.value);
</script>

<style scoped>

</style>