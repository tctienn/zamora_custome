<template>
  <div class='formgrid grid mb-3'>
    <div class='col-6'>
      <div class='bg-yellow-50 border-1 border-round-2xl border-yellow-400 font-bold px-3 py-2 w-max'>
        Từ:&nbsp;<strong>{{ moment(model.fromMonth).format('MM/YYYY') }}</strong>
        &nbsp;Đến:&nbsp;
        <strong>{{ moment(model.toMonth).format('MM/YYYY') }}</strong>
      </div>
    </div>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'companyUnit') }"
      :label='t("hrm.workProcess.companyUnit")'
      :value='model.companyUnit'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'address') }"
      :label='t("hrm.workProcess.address")'
      :value='model.address'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'jobPosition') }"
      :label='t("hrm.workProcess.jobPosition")'
      :value='model.jobPosition'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'salary') }"
      :label='t("hrm.workProcess.salary")'
      :value='model.salary'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'referencesPerson') }"
      :label='t("hrm.workProcess.references")'
      :value='model.referencesPerson'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'description') }"
      :label='t("hrm.workProcess.description")'
      :value='model.description'/>
    <LabelDisplay
      class='col-12'
      :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'reasonForLeaving') }"
      :label='t("hrm.workProcess.reasonForLeaving")'
      :value='model.reasonForLeaving'/>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import type { WorkProcess } from '@/apps/hrm/model/employee';
import useMoment from '@/common/helpers/mixins/use-moment';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

defineProps({
  index: {
    type: Number,
    default: null
  },
  model: {
    type: Object as PropType<WorkProcess>,
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