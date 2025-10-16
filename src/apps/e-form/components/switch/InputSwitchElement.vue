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
import InputSwitchElementAdvanceConfig from '@/apps/e-form/components/switch/InputSwitchElementAdvanceConfig.vue';
import InputSwitchElementEdit from '@/apps/e-form/components/switch/InputSwitchElementEdit.vue';

import InputSwitchElementConfig from './InputSwitchElementConfig.vue';
import InputSwitchElementPreview from './InputSwitchElementPreview.vue';

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
  [ElementMode.EDIT]: InputSwitchElementEdit,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.PREVIEW]: InputSwitchElementPreview,
  [ElementMode.CONFIG]: InputSwitchElementConfig,
  [ElementMode.ADVANCE]: InputSwitchElementAdvanceConfig,
};
</script>

<style scoped></style>