<template>
  <div class='flex px-2 py-0 work-block'>
    <div class='flex flex-column ml-2 w-full'>
      <div class='align-items-center flex justify-content-between'>
        <div
          class='time-tag'
          :class="{
            'time-tag-over': !isActiveJob,
          }">
          <div>
            Từ: <strong>{{ moment(model.fromDate).format('DD/MM/YYYY') }}</strong>
          </div>
          <div>
            <span
              v-if='model.toDate'
              class='ml-2'>đến: <strong>{{ moment(model.toDate).format('DD/MM/YYYY') }}</strong></span>
            <span
              v-else
              class='ml-2'>đến: <strong>hiện tại</strong></span>
          </div>
        </div>
        <div>
          <Badge
            v-if='!model.isConcurrent'
            class='ml-3 py-0 status-badge text-white'
            :class='isActiveJob ? "bg-blue-500" : "bg-red-400"'
            :value="t('hrm.contract.general.mainJob')">
          </Badge>
          <Badge
            v-else
            class='ml-3 py-0 status-badge text-white'
            :style="{background: '#33C9DC'}"
            :value="t('hrm.contract.general.multiJob')">
          </Badge>
        </div>
      </div>
      <div class='pb-3 pl-3 pt-2 work-process-block'>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'position') }"
          :label='t("hrm.contract.general.position")'
          :value='model.positionName'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'jobTitle') }"
          :label='t("hrm.contract.general.jobTitle")'
          :value='model.jobTitleName'/>
        <span class='my-2'>{{ t('hrm.contract.general.organization') }}: <strong>{{
          model.organizationName
        }}</strong></span>

        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'specializedJob') }"
          :label='t("hrm.profile.education.specializedJob")'
          :value='model.professionalWork'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'workDescription') }"
          :label='t("hrm.contract.general.workDescription")'
          :value='model.workDescription'/>
        <LabelDisplay
          :class="{ 'text-yellow-300 font-bold': isChanged(changedPropertiesValue,'employeeType') }"
          :label='t("hrm.contract.general.employeeType")'
          :value='model.employeeType ? model.employeeType : "Chính thức"'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import { isChanged } from '@/common/helpers/utils';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

defineProps({
  index: {
    type: Number,
    default: null
  },
  lastIndex: {
    type: Number,
    default: null
  },
  toDateTime: {
    type: String,
    default: null
  }
});
const { moment } = useMoment();
const { t } = useI18n();

const model = defineModel({
  type: Object as PropType<any>,
  default: {} as any
});
const hrmStore = useHrmProfileStore();
const { changedProperties } = storeToRefs(hrmStore);
const changedPropertiesValue = computed(() => changedProperties.value);
const isActiveJob = computed(() => {
  console.log(model.value.toDate);
  // Check by toDate = null, empty or toDate greater than current date
  if (!model.value.toDate || model.value.toDate === '') {
    return true;
  }
  if (new Date(model.value.toDate) > new Date()) {
    return true;
  }

  return false;
});
</script>

<style scoped>
.work-block {
  .time-tag {
    margin-left: -2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding-left: 1rem;
    padding-right: 1rem;
    justify-content: space-between;
    text-align: left;
    align-items: center;
    vertical-align: middle;
    align-self: center;
    width: max-content;
    min-width: 200px;
    height: 30px;
    border-radius: 30px;
    border: 1px dashed #56CD37;
    background-color: var(--bg-green-custom);
  }

  .work-status-tag {
    background-color: var(--badge);
  }

  .time-tag-over {
    border: 1px dashed var(--text-red) !important;
    background-color: var(--bg-white-custom2) !important;
  }

  &:not(:last-child) {
    .work-process-block {
      border-left: 1px dashed #000000A6;
    }
  }

  .work-process-block {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

</style>