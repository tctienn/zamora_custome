<template>
  <FormInputWrapper
    v-bind='$props'
    @update:label='$emit("update:label", $event)'>
    <InputNumber
      class='w-full'
      :disabled='true'
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
});

defineEmits(['update:label']);
</script>

<style scoped>

</style>