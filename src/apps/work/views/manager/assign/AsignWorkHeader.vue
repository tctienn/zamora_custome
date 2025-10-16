<template>
  <div class='align-items-center column-gap-3 flex flex-row flex-wrap justify-content-between ml-auto mt-1 pl-1 w-full'>

    <div class='align-items-center flex w-7'>
      <span class='w-14rem'>Chọn đơn vị xem</span>
      <InputText/>
    </div>

    <div class='align-items-center column-gap-2 flex flex-row justify-content-end w-4'>
      <label>{{ t('common.time') }}</label>
      <div class='align-items-center flex flex-row'>
        <Calendar
          v-model='dates.fromDate'
          class='p-0 w-7rem'
          input-class='text-sm bg-transparent border-none border border-bottom-1 shadow-none'
          input-id='searchFromDate'
          :manual-input='true'
          placeholder='dd/mm/yyyy'
          :show-button-bar='true'
          @update:model-value='updateDates($event, "from")'/>
        -
        <Calendar
          v-model='dates.toDate'
          class='p-0 w-7rem'
          input-class='text-sm bg-transparent border-none border border-bottom-1 shadow-none'
          input-id='searchFromDate'
          :manual-input='true'
          placeholder='dd/mm/yyyy'
          :show-button-bar='true'
          @update:model-value='updateDates($event, "to")'/>
      </div>
    </div>
  </div>

  <div class='align-items-center flex gap-8 mt-4 pl-1 w-full'>
    <div class='align-items-center flex gap-3'>
      <label
        for=''>Xem theo đơn vị hành chính</label>
      <RadioButton/>
    </div>
    <div class='align-items-center flex gap-3'>
      <label for=''>Xem theo nhóm dự án</label>
      <RadioButton/>
    </div>
    <div class='align-items-center flex gap-3'>
      <label for=''>Xem theo cá nhân</label>
      <RadioButton/>
    </div>
  </div>

  <div class='align-items-center flex mt-4 pl-1'>
    <label
      class='w-14rem'
      for=''>Chọn cá nhân xem</label>
    <InputText/>
  </div>
</template>

<script lang='ts' setup>

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  searchFromDate: {
    type: Date,
    default: new Date()
  },
  searchToDate: {
    type: Date,
    default: new Date()
  }
});

const emits = defineEmits(['update-range']);

const { t } = useI18n();

const dates = ref({
  fromDate: props.searchFromDate,
  toDate: props.searchToDate
});

function updateDates(date: Date | undefined, type: 'from' | 'to') {
  if (!date) {
    return;
  }
  if (type === 'from') {
    emits('update-range', {
      fromDate: date,
      toDate: dates.value.toDate
    });
  }
  if (type === 'to') {
    emits('update-range', {
      fromDate: dates.value.fromDate,
      toDate: date
    });
  }
}

</script>

<script lang='ts'>
export default { name: 'AssignWorkHeader' };
</script>

<style scoped>
</style>