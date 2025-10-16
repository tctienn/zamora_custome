<template>
  <FormInputWrapper
    v-bind='$props'>
    <NamedInputCalendar
      v-model='value'
      class='w-full'
      icon-display='input'
      :input-id='name'
      :invalid='!!error'
      :manual-input='false'
      :name='name'
      show-icon
      v-bind='omit($attrs, "class")'/>
  </FormInputWrapper>
</template>

<script lang='ts' setup>
import { omit } from 'lodash';
import { type PropType } from 'vue';

import { ElementMode } from '@/apps/e-form/components/element';
import FormInputWrapper from '@/apps/e-form/components/FormInputWrapper.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';

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
  disabled: {
    type: Boolean,
    default: false
  }
});

// eslint-disable-next-line vue/require-prop-types
const value = defineModel();

</script>

<style scoped>
/* Tuỳ chỉnh nếu cần */
</style>
