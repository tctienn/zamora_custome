<template>
  <FormInputWrapper
    v-bind='$props'>
    <InputText
      :id='name'
      v-model='value'
      v-trim
      class='w-full'
      :disabled='disabled'
      :invalid='!!error'
      :name='name'
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>

import { omit } from 'lodash';
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
  }
});

const value = defineModel({
  type: String,
  default: ''
});
</script>

<style scoped>

</style>