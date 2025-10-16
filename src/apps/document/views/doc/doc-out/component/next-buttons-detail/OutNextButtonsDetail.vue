<template>
  <OutNextButtonsOutSide
    :doc='doc'
    :process='process'>
  </OutNextButtonsOutSide>
</template>

<script lang="ts" setup>

import { type PropType } from 'vue';

import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { Process } from '@/apps/document/model/process/process';
import OutNextButtonsOutSide
  from '@/apps/document/views/doc/doc-out/component/next-buttons-outside/OutNextButtonsOutSide.vue';

const props = defineProps({
  process: {
    type: Object as PropType<Process | undefined>,
    required: true,
  },
  doc: {
    type: Object as PropType<DocOut | undefined>,
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