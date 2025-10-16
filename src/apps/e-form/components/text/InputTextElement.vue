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
import InputTextElementEdit from '@/apps/e-form/components/text/InputTextElementEdit.vue';
import InputTextElementPreview from '@/apps/e-form/components/text/InputTextElementPreview.vue';

import InputTextElementAdvanceConfig from './InputTextElementAdvanceConfig.vue';
import InputTextElementConfig from './InputTextElementConfig.vue';

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
  [ElementMode.EDIT]: InputTextElementEdit,
  [ElementMode.PREVIEW]: InputTextElementPreview,
  [ElementMode.CONFIG]: InputTextElementConfig,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.ADVANCE]: InputTextElementAdvanceConfig,
};

</script>

<style scoped>

</style>