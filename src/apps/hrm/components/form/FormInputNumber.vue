<template>
  <FormInputWrapper
    v-bind='$props'>
    <input
      :name='name'
      type='hidden'
      :value='value'/>
    <InputNumber
      v-model='value'
      class='w-full'
      :input-class='{
        "bg-highlight": bgHighlight
      }'
      :input-id='name'
      :invalid='!!error'
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';

import FormInputWrapper from '@/apps/hrm/components/form/FormInputWrapper.vue';

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
  bgHighlight: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
});

const value = defineModel({
  type: Number,
  default: undefined
});
</script>

<style scoped>
:deep(.p-inputnumber-input) {
  width: 100% !important;
}
</style>
