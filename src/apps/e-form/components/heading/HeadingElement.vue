<template>
  <component
    :is='components[mode]'
    v-bind='props'/>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import FieldView from '@/apps/e-form/components/componentView/FieldView.vue';
import { ElementMode } from '@/apps/e-form/components/element';
import HeadingElementAdvanceConfig from '@/apps/e-form/components/heading/HeadingElementAdvanceConfig.vue';

import HeadingElementConfig from './HeadingElementConfig.vue';
import HeadingElementEdit from './HeadingElementEdit.vue';
import HeadingElementPreview from './HeadingElementPreview.vue';

const props = defineProps({
  mode: {
    type: String as PropType<ElementMode>,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  tag: {
    type: String as PropType<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>,
    default: 'h1',
  },

  align: {
    type: String as PropType<'left' | 'center' | 'right'>,
    default: 'left',
  },
  fontSize: {
    type: String,
    default: undefined,
  },
  color: {
    type: String,
    default: undefined,
  },
  fontWeight: {
    type: String,
    default: undefined,
  },
});

const components = {
  [ElementMode.EDIT]: HeadingElementEdit,
  [ElementMode.PREVIEW]: HeadingElementPreview,
  [ElementMode.CONFIG]: HeadingElementConfig,
  [ElementMode.VIEW]: FieldView,
  [ElementMode.ADVANCE]: HeadingElementAdvanceConfig
} as const;
</script>
