<template>
  <div class='flex gap-2'>
    <HrmCheckinTotalDisplayComponent
      class='bg-blue-500 cursor-pointer text-white'
      :count='total'
      :title='t("hrm.camera.checkin.count.total")'
      @click='chooseTab(1)'/>
    <HrmCheckinTotalDisplayComponent
      class='bg-green-500 cursor-pointer text-white'
      :count='checkedIn'
      :title='t("hrm.camera.checkin.count.checkedIn")'
      @click='chooseTab(2)'/>
    <HrmCheckinTotalDisplayComponent
      class='bg-yellow-500 cursor-pointer text-white'
      :count='guests'
      :title='t("hrm.camera.checkin.count.guests")'
      @click='chooseTab(3)'/>
  </div>
</template>

<script lang='ts' setup>

import { useI18n } from 'vue-i18n';

import HrmCheckinTotalDisplayComponent from '@/apps/hrm/views/checkin/HrmCheckinTotalDisplayComponent.vue';

defineProps({
  total: {
    type: Number,
    default: 0
  },
  checkedIn: {
    type: Number,
    default: 0
  },
  guests: {
    type: Number,
    default: 0
  }
});

const emits = defineEmits(['choose-tab']);
const { t } = useI18n();

function chooseTab(number: number) {
  emits('choose-tab', number);
}
</script>

<style scoped>

</style>