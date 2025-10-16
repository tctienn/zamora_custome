<template>
  <NextButtonsOutSide
    :class-btn='`border-300`'
    :doc='doc'
    :process='process'>
  </NextButtonsOutSide>
</template>

<script lang="ts" setup>

import { type PropType } from 'vue';

import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { Process } from '@/apps/document/model/process/process';
import NextButtonsOutSide from '@/apps/document/views/doc/doc-in/component/next-buttons-outside/NextButtonsOutSide.vue';

const props = defineProps({
  process: {
    type: Object as PropType<Process | undefined>,
    required: true,
  },
  doc: {
    type: Object as PropType<DocIn | undefined>,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>

</style>