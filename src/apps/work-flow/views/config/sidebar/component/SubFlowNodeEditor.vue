<template>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.node.label') }}
    </label>
    <div>
      <InputText
        class='w-full'
        :model-value='nodeSource?.data["label"]'
        @update:model-value='updateLabel'>
      </InputText>
    </div>
  </div>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.chooseFlow') }}
    </label>
    <div>
      <Dropdown
        v-model='selectedFlowId'
        class='w-full'
        filter
        filter-locale='vi'
        option-label='name'
        option-value='id'
        :options='subFlowOptions'>
      </Dropdown>
    </div>
  </div>
  <OutcomesSubflowEditor
    :node-id='nodeId'
    :nodes='nodes'
    store-id='subFlow'>
  </OutcomesSubflowEditor>
  <div class='h-full w-full'>
    <MyFlow
      v-if='selectedFlowId'
      id='subFlow'
      :default-edge-options='{
        markerEnd: MarkerType.ArrowClosed,
        type: "approve",
        updatable: true
      }'
      :edges='edges'
      :edges-updatable='false'
      fit-view-on-init
      :nodes='nodes'
      :nodes-draggable='false'
      store-id='subFlow'>

    </MyFlow>
  </div>

</template>

<script lang="ts" setup>
import { type FindNode, MarkerType, useVueFlow, } from '@vue-flow/core';
import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { GraphNode, Node } from '@vue-flow/core/dist/types/node';
import { get } from 'lodash';
import { computed, inject, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { flowsByType, loadFlow, } from '@/apps/work-flow/api/graphql/flow-api';
import type { EdgeInputInterface, FlowInterface, NodeInputInterface, } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import MyFlow from '@/apps/work-flow/views/config/flow/MyFlow.vue';
import OutcomesSubflowEditor
  from '@/apps/work-flow/views/config/sidebar/component/EditorFragment/OutcomesSubflowEditor.vue';
import { updateNodeDataByField } from '@/apps/work-flow/views/config/sidebar/UpdateNodeData';

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
  storeId: {
    type: String,
    default: 'main'
  }
});
const { t } = useI18n();

const findNodeMain = inject<FindNode>('findNodeDataMain', () => {
  throw new Error('findNodeDataMain not provided');
});

let nodeSource: GraphNode | undefined = findNodeMain(props.nodeId);
const selectedFlowId = ref<string>(nodeSource?.data?.flowId);

const loadAndSetFlow = (flowId: string) => {
  loadFlow(flowId).onResult((param) => {
    const { nodes: nodeDatas, edges: edgeDatas } = get(param, 'data.loadFlow');
    fromObject({
      position: [0, 0],
      zoom: 0,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      },
      nodes: nodeDatas.map((node: NodeInputInterface) => ({
        ...node,
        data: {
          ...node.data,
          notEditable: true
        }
      })),
      edges: edgeDatas.map((node: EdgeInputInterface) => ({
        ...node,
        data: {
          ...node.data,
          notEditable: true
        }
      }))
    }).then(() => fitView());
  });
};

watch(
  () => props.nodeId,
  (nodeId) => {
    nodeSource = findNodeMain(nodeId);
    selectedFlowId.value = nodeSource?.data?.flowId;
  }
);

const { fitView, fromObject } = useVueFlow('subFlow');

const {
  onResult: flowsOnResult,
  onError: flowsOnError,
  loading: isLoading,
  result: flowsResult,
  load: flowsLoad,
} = flowsByType();

const flowType: Ref<FlowType | undefined> = inject(
  'flowType',
    {} as Ref<FlowType | undefined>
);

const subFlowOptions = computed<FlowInterface[]>(() => {
  return flowsResult.value?.flowsByType || [];
});

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
flowsLoad(undefined, { type: flowType.value?.type });

if (nodeSource?.data?.flowId) {
  loadAndSetFlow(nodeSource.data.flowId);
}

watch(
  () => selectedFlowId.value,
  (value) => {
    if (value) {
      loadAndSetFlow(value);
      updateNodeDataByField(nodeSource, 'flowId', value);
    }
  }
);

function updateLabel(label: string) {
  updateNodeDataByField(nodeSource, 'label', label);
}

</script>

<style scoped>

</style>