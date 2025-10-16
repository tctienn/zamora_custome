<template>
  <FormInputWrapper
    v-bind='$props'
    @update:label='$emit("update:label", $event)'>
    <Dropdown
      class='w-full'
      disabled
      :input-id='name'
      :input-props='{name}'
      :invalid='!!error'
      :is-show-clear='isShowClear'
      :options='options'
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
  options: {
    type: Array,
    default: () => []
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
  isShowClear: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:label']);
</script>

<style scoped>

</style>