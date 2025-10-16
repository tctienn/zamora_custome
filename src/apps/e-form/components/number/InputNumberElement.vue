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
import InputNumberElementConfig from '@/apps/e-form/components/number/InputNumberElementConfig.vue';
import InputNumberElementEdit from '@/apps/e-form/components/number/InputNumberElementEdit.vue';

import InputNumberElementPreview from './InputNumberElementPreview.vue';

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
  [ElementMode.EDIT]: InputNumberElementEdit,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.PREVIEW]: InputNumberElementPreview,
  [ElementMode.CONFIG]: InputNumberElementConfig,
  [ElementMode.ADVANCE]: InputNumberElementEdit,
};
</script>

<style scoped></style>