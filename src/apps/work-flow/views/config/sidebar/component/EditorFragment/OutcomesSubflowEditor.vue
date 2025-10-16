<template>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.outcomes') }}
    </label>
    <div class='flex flex-column gap-2 mb-2'>
      <div
        v-for='(outcome,index) in outcomes'
        :key='index'
        class='input-area p-inputtext w-full'>
        <div
          class='bg-transparent border-none input-none p-1 w-full'>
          {{ outcome.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type FindNode, useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { computed, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Outcome } from '@/apps/work-flow/model/flow';
import { updateNodeDataByField } from '@/apps/work-flow/views/config/sidebar/UpdateNodeData';

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
    default: '',
  },
  storeId: {
    type: String,
    default: 'main'
  }
});
const { t } = useI18n();

const outcomes = computed<Outcome[]>(() => {
  const namesSet = new Set<string>();
  return getNodes.value.filter(e => e.type === 'END').map((e): Outcome => {
    return {
      name: e.data.label,
      label: e.data.label
    };
  }).filter(outcome => {
    if (namesSet.has(outcome.name)) {
      return false;
    }
    namesSet.add(outcome.name);
    return true;
  });
});
const findNodeMain = inject<FindNode>('findNodeDataMain', () => {
  throw new Error('findNodeDataMain not provided');
});
watch(
  () => props.nodeId,
  (nodeId) => {
    nodeSource = findNodeMain(nodeId);
  }
);

let nodeSource: GraphNode | undefined = findNodeMain(props.nodeId);
const { getNodes } = useVueFlow(props.storeId);
watch(() => outcomes.value, (value) => {
  updateNodeDataByField(nodeSource, 'outcomes', value);
});
</script>

<style scoped>
input:focus {
  outline: none;
  box-shadow: none;
}

.input-none {
  :focus {
    outline: none;
    box-shadow: none;
  }
}

.input-area:hover {
  .input-icon {
    opacity: 1;
  }
}
</style>