<template>
  <ProcessHisFlowOrientUser
    v-if='orientType=="user"'
    :process='process'
    :store-id='storeId'/>
  <ProcessHisFlowOrientProcess
    v-if='orientType=="process"'
    :process='process'
    :store-id='storeId'/>

</template>

<script lang="ts" setup>
import { type PropType } from 'vue';

import type { Process } from '@/apps/document/model/process/process';
import ProcessHisFlowOrientProcess
  from '@/apps/work-flow/views/components/ProcessHisFlow/ProcessHisFlowOrientProcess.vue';
import ProcessHisFlowOrientUser from '@/apps/work-flow/views/components/ProcessHisFlow/ProcessHisFlowOrientUser.vue';

const props = defineProps({
  orientType: {
    type: String as PropType<'process' | 'user'>,
    default: 'process'
  },
  storeId: {
    type: String,
    default: 'processHistory'
  },
  process: {
    type: Array as PropType<Process[]>,
    required: true
  }
});
</script>

<style lang='scss'>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';

.line-legend {
  width: 3rem;
  height: 3px;
}
</style>
