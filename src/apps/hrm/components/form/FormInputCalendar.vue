<template>
  <FormInputWrapper
    v-bind='$props'>
    <NamedInputCalendar
      v-model='value'
      v-bind='omit($attrs, "class")'
      class='w-full'
      icon-display='input'
      :input-class='{
        "bg-highlight": bgHighlight
      }'
      :input-id='name'
      :invalid='!!error'
      :manual-input='!range'
      :min-date='minDate'
      :name='name'
      :selection-mode='range? "range": "single"'
      show-icon/>
  </FormInputWrapper>
</template>

<script setup lang='ts'>
import { omit } from 'lodash';
import type { PropType } from 'vue';

import FormInputWrapper from '@/apps/hrm/components/form/FormInputWrapper.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';

defineProps({
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: undefined
  },
  minDate: {
    type: [String, Date],
    default: ''
  },
  bgHighlight: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  range: {
    type: Boolean,
    default: false
  },
  inputFormat: {
    type: String,
    default: 'YYYY-MM-DD'
  },
});

const value = defineModel({
  type: Object as PropType<Date | Array<Date> | Array<Date | null> | undefined | null>,
  default: undefined
});

</script>

<style scoped>

</style>
