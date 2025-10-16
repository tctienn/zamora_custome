<template>
  <div class='flex px-2 py-0 work-block'>
    <div class='flex flex-column ml-2 w-full'>
      <div class='align-items-center flex justify-content-start'>
        <div
          class='time-tag'>
          <div>
            Từ: <strong v-if='model.expireDate'>{{ moment(model.expireDate).format('MM/YYYY') }}</strong>
          </div>
          <div
            class='ml-2'>đến: <strong v-if='model.effectDate'>{{ moment(model.effectDate).format('MM/YYYY') }}</strong></div>
        </div>

      </div>
      <div class='pb-3 pl-3 pt-2 work-process-block'>
        <LabelDisplay
          :label='t("hrm.contract.general.position")'
          :value='model.position'/>
        <LabelDisplay
          :label='t("hrm.contract.general.jobTitle")'
          :value='model.jobTitle'/>
        <LabelDisplay
          :label='t("hrm.contract.general.organization")'
          :value='model.organizationName'/>
        <LabelDisplay
          :label='t("hrm.profile.education.specializedJob")'
          :value='model.specialization'/>
        <LabelDisplay
          :label='t("hrm.contract.general.workDescription")'
          :value='model.groupName'/>
        <LabelDisplay
          :label='t("hrm.contract.general.employeeType")'
          :value='model.employeeType ? model.employeeType : "Chính thức"'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelDisplay from '@/apps/hrm/components/custom/LabelDisplay.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

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
    border: 1px dashed #3E84F6;
    background-color: var(--bg-blue-custom2);
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