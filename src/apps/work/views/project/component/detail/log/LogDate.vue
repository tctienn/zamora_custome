<template>
  <div class='flex flex-column font-semibold'>
    <div
      class='mx-0 single-line text-3xl text-center'
      :style="{color:isSunday()?'#F36F24':'#0F6CBD'}">{{ upperFirst(moment(date).format('dddd')) }}
    </div>
    <div class='flex justify-content-center'> {{ moment(date).format('DD/MM/YYYY') }}
    </div>
    <div
      v-if='!isLastDate'
      class='dashed-line'></div>
  </div>
</template>

<script setup lang="ts">
import { upperFirst } from 'lodash';

import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  isLastDate: {
    type: Boolean,
    required: true
  }
});

function isSunday(): boolean {
  return moment(props.date).weekday() === 6;
}

const { moment } = useMoment();
</script>

<style scoped>

.single-line {
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

.dashed-line {
  border-left: 1px dashed #000;
  height: 100%;
  margin: .5rem auto;
}
</style>