<template>
  <component
    :is='components[mode]'
    v-bind='$props'
    @update:label='$emit("update:label", $event)'/>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import InputAreaElementAdvanceConfig from '@/apps/e-form/components/area/InputAreaElementAdvanceConfig.vue';
import InputAreaElementConfig from '@/apps/e-form/components/area/InputAreaElementConfig.vue';
import InputAreaElementEdit from '@/apps/e-form/components/area/InputAreaElementEdit.vue';
import FieldView from '@/apps/e-form/components/componentView/FieldView.vue';
import { ElementMode } from '@/apps/e-form/components/element';

import InputAreaElementPreview from './InputAreaElementPreview.vue';

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
  [ElementMode.EDIT]: InputAreaElementEdit,
  [ElementMode.PREVIEW]: InputAreaElementPreview,
  [ElementMode.CONFIG]: InputAreaElementConfig,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.ADVANCE]: InputAreaElementAdvanceConfig,
};

</script>

<style scoped></style>