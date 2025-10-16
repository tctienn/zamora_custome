<template>
  <FormInputWrapperHorizontal
    v-bind='$props'
    @update:label='$emit("update:label", $event)'>
    <InputSwitch
      disabled
      :input-id='name'
      :invalid='!!error'
      :name='name'
      :pt='{
        input: {
          name: name
        }
      }'/>
  </FormInputWrapperHorizontal>

</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import { ElementMode } from '@/apps/e-form/components/element';
import FormInputWrapperHorizontal from '@/apps/e-form/components/FormInputWrapperHorizontal.vue';

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
defineEmits(['update:label']);
</script>

<style scoped>

</style>