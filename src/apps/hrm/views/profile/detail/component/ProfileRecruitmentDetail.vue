<template>
  <div class='formgrid grid'>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'recruitmentDate') }"
      :label='t("hrm.profile.recruitment.recruitmentDate")'
      :value='model.recruitmentDate && moment(model.recruitmentDate).format("DD/MM/YYYY")'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'jobBeforeRecruitment') }"
      :label='t("hrm.profile.recruitment.jobBeforeRecruitment")'
      :value='model.jobBeforeRecruitment'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'recruitmentForm') }"
      :label='t("hrm.profile.recruitment.recruitmentForm")'
      :value='model.recruitmentForm'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'recruitmentAgency') }"
      :label='t("hrm.profile.recruitment.recruitmentAgency")'
      :value='model.recruitmentAgency'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'recruitmentPosition') }"
      :label='t("hrm.profile.recruitment.recruitmentPosition")'
      :value='model.recruitmentPosition'/>
    <LabelDisplay
      class='col-6'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'isOldStaff') }"
      :label='t("hrm.profile.recruitment.isOldStaff")'
      :value='model.isOldStaff ? t("common.yes") : t("common.no")'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'note') }"
      :label='t("hrm.profile.recruitment.note")'
      :value='model.note'/>
  </div>
</template>

<script setup lang='ts'>
import { camelCase } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { EmployeeRecruitment } from '@/apps/hrm/model/employee';
import useMoment from '@/common/helpers/mixins/use-moment';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const hrmStore = useHrmProfileStore();
const { changedProperties } = storeToRefs(hrmStore);
const changedPropertiesValue = computed(() => changedProperties.value);
const { moment } = useMoment();
const { t } = useI18n();
const model = defineModel({
  type: Object as PropType<EmployeeRecruitment>,
  default: {} as EmployeeRecruitment
});
</script>

<style scoped>

</style>