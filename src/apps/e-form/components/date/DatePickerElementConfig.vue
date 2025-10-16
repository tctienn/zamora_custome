<template>
  <FormInputWrapper
    v-bind='$props'
    @update:label='$emit("update:label", $event)'>
    <Calendar
      v-model='value'
      class='w-full'
      :disabled='true'
      icon-display='input'
      show-icon
      v-bind='$props'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import Calendar from 'primevue/calendar';
import type { PropType } from 'vue';

import { ElementMode } from '@/apps/e-form/components/element';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';

// Đây là config của phần tử form
const props = defineProps({
  mode: {
    type: String as PropType<ElementMode>,
    required: true,
  },
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
  required: {
    type: Boolean,
    default: false
  },
});

defineEmits(['update:label']);
// Bind với form model
const value = defineModel({
  type: Object as PropType<Date | Array<Date> | Array<Date | null> | undefined | null>,
  default: null
});
</script>

<style scoped>
/* Tuỳ chỉnh nếu cần */
</style>
