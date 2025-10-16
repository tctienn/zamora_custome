<template>
  <div
    class='absolute bg-cyan-200 border-round-sm flex flex-column gap-4 p-2 shadow-1'
    style='z-index: 5;top:5rem'>
    <StartNodeContent
      class='cursor-pointer select-none'
      draggable='true'
      @click='addNode(NodeType.START,cloneDeep(startNodeData))'
      @dragstart='onDragStart($event,NodeType.START,cloneDeep(startNodeData))'/>
    <BasicNodeContent
      class='cursor-pointer select-none'
      draggable='true'
      label='Basic'
      @click='addNode(NodeType.BASIC,cloneDeep(startNodeData))'
      @dragstart='onDragStart($event,NodeType.BASIC,cloneDeep(startNodeData))'/>
    <SubFlowNodeContent
      class='cursor-pointer select-none'
      draggable='true'
      label='Sub flow'
      @click='addNode(NodeType.SUB_FLOW)'
      @dragstart='onDragStart($event,NodeType.SUB_FLOW)'/>
    <SplitNodeContent
      class='cursor-pointer'
      draggable='true'
      label='Split'
      @click='addNode(NodeType.SPLIT)'
      @dragstart='onDragStart($event,NodeType.SPLIT)'/>
    <MergeNodeContent
      class='cursor-pointer'
      draggable='true'
      label='Join'
      @click='addNode(NodeType.JOIN)'
      @dragstart='onDragStart($event,NodeType.JOIN)'/>
    <EndNodeContent
      class='cursor-pointer'
      draggable='true'
      label='End'
      @click='addNode(NodeType.END)'
      @dragstart='onDragStart($event,NodeType.END)'/>
  </div>
</template>

<script lang='ts' setup>

import { useVueFlow } from '@vue-flow/core';
import { cloneDeep } from 'lodash';
import { computed, type ComputedRef, inject, type Ref } from 'vue';

import { NodeType, type Outcome } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import BasicNodeContent from '@/apps/work-flow/views/config/node/content/BasicNodeContent.vue';
import EndNodeContent from '@/apps/work-flow/views/config/node/content/EndNodeContent.vue';
import MergeNodeContent from '@/apps/work-flow/views/config/node/content/MergeNodeContent.vue';
import SplitNodeContent from '@/apps/work-flow/views/config/node/content/SplitNodeContent.vue';
import StartNodeContent from '@/apps/work-flow/views/config/node/content/StartNodeContent.vue';
import SubFlowNodeContent from '@/apps/work-flow/views/config/node/content/SubFlowNodeContent.vue';
import useDragAndDrop, { getIdByType, getNodeData, getNodeLabel } from '@/apps/work-flow/views/config/useDnD';

const { onDragStart } = useDragAndDrop();
const { addNodes } = useVueFlow('main');
const flowType: Ref<FlowType | undefined> = inject('flowType', {} as Ref<FlowType | undefined>);
const data: ComputedRef<{
  outcomes: Outcome[]
} | undefined> = computed(() => flowType.value?.actions ? { outcomes: flowType.value?.actions as Outcome[] } : undefined);
const startNodeData: ComputedRef<{ outcomes: Outcome[] } | undefined> = computed(() => {
  return data.value?.outcomes[0] ? { outcomes: [data.value?.outcomes[0]] as Outcome[] } : undefined;
});
function addNode(type: string, data?: { [key: string]: object }) {
  addNodes(
    {
      id: getIdByType(type),
      data: {
        label: getNodeLabel(type),
        ...getNodeData(type, data)
      },
      position: {
        x: 0,
        y: 0
      },
      type
    }
  );
}
</script>

<style scoped>

</style>