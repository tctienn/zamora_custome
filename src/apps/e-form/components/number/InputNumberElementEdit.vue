<template>
  <FormInputWrapper
    v-bind='$props'>
    <InputNumber
      v-model='value'
      class='w-full'
      :input-id='name'
      :input-props='{ name }'
      :invalid='!!error'
      v-bind='omit($attrs, "class", "mode")'/>
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
  type: Number,
  default: null
});
</script>

<style scoped>

</style>