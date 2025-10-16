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
import InputRadioButtonElementAdvanceConfig
  from '@/apps/e-form/components/radio/InputRadioButtonElementAdvanceConfig.vue';
import InputRadioButtonElementEdit from '@/apps/e-form/components/radio/InputRadioButtonElementEdit.vue';
import InputRadioButtonElementPreview from '@/apps/e-form/components/radio/InputRadioButtonElementPreview.vue';

import InputRadioButtonElementConfig from './InputRadioButtonElementConfig.vue';

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
const components = {
  [ElementMode.EDIT]: InputRadioButtonElementEdit,
  [ElementMode.PREVIEW]: InputRadioButtonElementPreview,
  [ElementMode.CONFIG]: InputRadioButtonElementConfig,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.ADVANCE]: InputRadioButtonElementAdvanceConfig
};
</script>

<style scoped></style>