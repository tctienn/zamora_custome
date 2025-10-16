<template>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.outcomes') }}
    </label>
    <div class='flex flex-column gap-2 mb-2'>
      <div
        v-for='(outcome,index) in outcomes'
        :key='index'
        class='w-full'>
        <InputExpand
          v-model='outcomes[index]'
          :can-expand='true'
          :style='{background:outcomes[index].color}'
          @delete='deleteOutcome($event,index)'
          @update:outcome='updateOutcome($event,outcome,index)'/>
      </div>
    </div>
    <div
      v-if='!disableAddOutcome'
      class='cursor-pointer'>
      <a
        class='hover:underline no-underline'
        @click.prevent='addOutcome'>
        {{ t('work-flow.flow.addOutcome') }}
      </a>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphEdge } from '@vue-flow/core/dist/types/edge';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { cloneDeep } from 'lodash';
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, inject, provide, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Outcome } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import InputExpand from '@/apps/work-flow/views/config/sidebar/component/EditorFragment/InputExpand.vue';
import { generateOutcomeByName } from '@/apps/work-flow/views/config/sidebar/component/EditorFragment/OutcomeGenerationStrategy';
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
  },
  disableAddOutcome: {
    type: Boolean,
    default: false
  },
  generateOutcome: {
    type: String,
    default: undefined
  }
});
const { t } = useI18n();

const { findNode, getEdges, updateEdgeData } = useVueFlow(props.storeId);
let node: GraphNode | undefined;
const outcomes = ref<Outcome[]>([]);
watch(() => props.nodeId, (nodeId) => {
  node = findNode(nodeId);
  outcomes.value = cloneDeep(node?.data['outcomes'] || []);
}, { immediate: true });
const usedOutcomes: ComputedRef<string[]> = computed(() => outcomes.value.map(e => e.name));
provide('usedOutcomes', usedOutcomes);

watch(outcomes, value => {
  updateNodeDataByField(node, 'outcomes', value);
}, { deep: true });

// const outcomes = ref<OutcomeInterface[]>(node?.data['outcomes'] || []);

function updateOutcome(newValue: Outcome, oldValue: Outcome, index: number) {
  if (node) {
    updateEdge(oldValue, newValue);
  }
}

const flowType: Ref<FlowType | undefined> = inject('flowType', {} as Ref<FlowType | undefined>);

function addOutcome() {
  outcomes.value = [...outcomes.value,
    !flowType.value?.actions
      ? generateOutcomeByName(props.generateOutcome || t('work-flow.flow.defaultOutcome'), outcomes.value)
      : {} as Outcome
  ];
}

const confirm = useConfirm();

function deleteOutcome(outcome: Outcome, index: number) {
  if (!node) {
    return;
  }

  const oldOutcomes = [...node.data['outcomes']];
  const outcomesInUse = getEdges.value.filter(
    (e: GraphEdge) => e.source === props.nodeId && e.data?.outcome === outcome.name
  );

  const handleConfirmAccept = () => {
    outcomes.value = outcomes.value.filter((e, i) => i != index);
    // updateEdge(outcome, t('work-flow.flow.selectOutcome'));
  };

  if (outcomesInUse.length > 0) {
    confirm.require({
      message: `${t('work-flow.flow.outcome')} ${t('work-flow.flow.isBeingUsed')}.
            \n ${t('common.confirmDelete', {
    itemType: t('work-flow.flow.outcome'),
    itemName: outcome.label
  })}      `,
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: handleConfirmAccept,
    });
  } else {
    handleConfirmAccept();
  }
}

function updateEdge(prevOutcome: Outcome, outcome: Outcome) {
  const findEdgeByOutcome = (outcomeName: string): GraphEdge | undefined => getEdges.value
    .filter(e => e.source === props.nodeId)
    .find(e => e.data?.outcome === outcomeName);

  const edgePrev = findEdgeByOutcome(prevOutcome.name);
  const edge = findEdgeByOutcome(outcome.name);

  const swapEdgeData = (edge: GraphEdge, updatedOutcome: Outcome) => {
    updateEdgeData(edge.id, {
      outcome: updatedOutcome.name,
      label: updatedOutcome.label
    });
  };

  if (edgePrev) {
    swapEdgeData(edgePrev, outcome);
  }
  if (edge) {
    swapEdgeData(edge, prevOutcome);
  }
}

</script>

<script lang='ts'>
export default { name: 'OutcomesEditor' };
</script>

<style scoped>

</style>