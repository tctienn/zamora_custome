<template>
  <component
    :is='components[mode]'
    v-bind='$props'
    @update:label='$emit("update:label", $event)'/>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import FieldView from '@/apps/e-form/components/componentView/FieldView.vue';
import { ElementMode } from '@/apps/e-form/components/element';

import DatePickerElementAdvanceConfig from './DatePickerElementAdvanceConfig.vue';
import DatePickerElementConfig from './DatePickerElementConfig.vue';
import DatePickerElementEdit from './DatePickerElementEdit.vue';
import DatePickerElementPreview from './DatePickerElementPreview.vue';

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

const components = {
  [ElementMode.EDIT]: DatePickerElementEdit,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.PREVIEW]: DatePickerElementPreview,
  [ElementMode.CONFIG]: DatePickerElementConfig,
  [ElementMode.ADVANCE]: DatePickerElementAdvanceConfig,
};
</script>

<style scoped>

</style>