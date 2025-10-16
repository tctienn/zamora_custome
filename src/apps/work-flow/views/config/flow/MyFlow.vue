<template>
  <VueFlow
    v-bind='$attrs'>
    <slot></slot>
    <template #edge-approve='approveEdgeProps'>
      <ApproveEdge
        :store-id='storeId'
        v-bind='approveEdgeProps'></ApproveEdge>
    </template>
    <template #node-SUB_FLOW='props'>
      <SubFlowNode
        :id='props.id'
        :data='props.data'
        :edges='getConnectedEdges(props.id)'
        :label='props.data.label'
        :store-id='storeId'>
      </SubFlowNode>
    </template>

    <template #node-START='props'>
      <StartNode
        :id='props.id'
        :data='props.data'
        :edges='getConnectedEdges(props.id)'
        :label='props.data.label'
        :store-id='storeId'/>
    </template>

    <template #node-END='props'>
      <EndNode
        :id='props.id'
        :data='props.data'
        :edges='getConnectedEdges(props.id)'
        :label='props.data.label'
        :store-id='storeId'/>
    </template>

    <template #node-BASIC='props'>
      <BasicNode
        :id='props.id'
        :data='props.data'
        :edges='getConnectedEdges(props.id)'
        :label='props.data.label'
        :store-id='storeId'/>
    </template>
    <template #node-SPLIT='props'>
      <SplitNode
        :id='props.id'
        :data='props.data'
        :edges='getConnectedEdges(props.id)'
        :label='props.data.label'
        :store-id='storeId'/>
    </template>
    <template #node-JOIN='props'>
      <JoinNode
        :id='props.id'
        :data='props.data'
        :edges='getConnectedEdges(props.id)'
        :label='props.data.label'
        :store-id='storeId'/>
    </template>
  </VueFlow>
</template>

<script lang="ts" setup>
import { useVueFlow, VueFlow } from '@vue-flow/core';

import ApproveEdge from '@/apps/work-flow/views/config/edge/ApproveEdge.vue';
import BasicNode from '@/apps/work-flow/views/config/node/BasicNode.vue';
import EndNode from '@/apps/work-flow/views/config/node/EndNode.vue';
import JoinNode from '@/apps/work-flow/views/config/node/JoinNode.vue';
import SplitNode from '@/apps/work-flow/views/config/node/SplitNode.vue';
import StartNode from '@/apps/work-flow/views/config/node/StartNode.vue';
import SubFlowNode from '@/apps/work-flow/views/config/node/SubFlowNode.vue';

const props = defineProps({
  storeId: {
    type: String,
    required: true
  }
});
const { getConnectedEdges, } = useVueFlow(props.storeId);
</script>

<style scoped>

</style>