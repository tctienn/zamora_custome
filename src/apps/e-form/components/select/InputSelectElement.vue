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
import InputSelectElementAdvanceConfig from '@/apps/e-form/components/select/InputSelectElementAdvanceConfig.vue';
import InputSelectElementEdit from '@/apps/e-form/components/select/InputSelectElementEdit.vue';
import InputSelectElementPreview from '@/apps/e-form/components/select/InputSelectElementPreview.vue';

import InputSelectElementConfig from './InputSelectElementConfig.vue';

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
  [ElementMode.EDIT]: InputSelectElementEdit,
  [ElementMode.PREVIEW]: InputSelectElementPreview,
  [ElementMode.CONFIG]: InputSelectElementConfig,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.ADVANCE]: InputSelectElementAdvanceConfig,
};
</script>

<style scoped></style>