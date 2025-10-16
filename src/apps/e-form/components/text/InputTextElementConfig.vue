<template>
  <FormInputWrapper
    v-bind='$props'
    @update:label='$emit("update:label", $event)'>
    <InputText
      :id='name'
      class='w-full'
      :disabled='true'
      :invalid='!!error'
      :maxlength='maxLength'
      :name='name'
      :placeholder='placeholder'
      :show-clear='showClear'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import { ElementMode } from '@/apps/e-form/components/element';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';

defineProps({
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
  disabled: {
    type: Boolean,
    default: false
  },

  // Advance Config Props
  placeholder: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: undefined
  },
  showClear: {
    type: Boolean,
    default: false
  },
});

defineEmits(['update:label']);
</script>

<style scoped>
</style>
