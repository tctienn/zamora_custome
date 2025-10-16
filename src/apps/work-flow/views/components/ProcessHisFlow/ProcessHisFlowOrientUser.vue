<template>
  <VueFlow
    :default-edge-options='{
      markerEnd:MarkerType.ArrowClosed
    }'
    :edges='edges'
    :edges-updatable='false'
    :nodes='nodes'
    :nodes-connectable='false'
    :store-id='storeId'
    @nodes-initialized="layoutGraph('LR')">
    <template #node-HIS_BASIC_NODE='props'>
      <HisBasicNodeUser
        :id='props.id'
        :data='props.data'
        :source-position='props.sourcePosition'
        :store-id='storeId'
        :target-position='props.targetPosition'
        :view-detail-type='viewDetailType'>
      </HisBasicNodeUser>
    </template>

    <template #edge-HIS_BASIC_EDGE='edgeProps'>
      <HisBasicEdgeUser
        :id='edgeProps.id'
        :data='edgeProps.data'
        :marker-end='edgeProps.markerEnd'
        :source='edgeProps.source'
        :source-position='edgeProps.sourcePosition'
        :source-x='edgeProps.sourceX'
        :source-y='edgeProps.sourceY'
        :target='edgeProps.target'
        :target-position='edgeProps.targetPosition'
        :targetX='edgeProps.targetX'
        :targetY='edgeProps.targetY'>
      </HisBasicEdgeUser>
    </template>

    <Panel
      class='border-1 border-round flex flex-column gap-2 p-2 surface-border'
      :class="{'bg-gray-800':layoutConfig.colorScheme.value==='dark',
               'bg-white':layoutConfig.colorScheme.value==='light'}"
      position='top-right'>
      <div class='flex gap-2'>
        <ButtonIcon
          v-tooltip.top="'Sắp xếp từ trái sang phải'"
          icon='swap_horiz'
          @click="layoutGraph('LR')">
        </ButtonIcon>
        <ButtonIcon
          v-tooltip.top="'Sắp xếp từ trên xuống dưới'"
          icon='swap_vert'
          @click="layoutGraph('TB')">
        </ButtonIcon>
        <!--        <ButtonIcon-->
        <!--          v-tooltip.top='viewDetailType!=="inNode"?"Xem chi tiết trong nốt":"Xem chi tiết khi di chuột"'-->
        <!--          :icon='viewDetailType==="inNode"?"help_outline":"info"'-->
        <!--          @click='()=>{viewDetailType==="inNode"? viewDetailType= "onHover":viewDetailType="inNode";layoutGraph(currentLayOut)}'/>-->
      </div>
    </Panel>
  </VueFlow>
</template>

<script lang="ts" setup>
import { MarkerType, Panel, useVueFlow, VueFlow, type XYPosition } from '@vue-flow/core';
import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { cloneDeep, get, groupBy } from 'lodash';
import { computed, nextTick, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Process } from '@/apps/document/model/process/process';
import { loadFlowInstance } from '@/apps/work-flow/api/graphql/flow-api';
import { type NodeProcess } from '@/apps/work-flow/views/components/ProcessHisFlow/constructGraph';
import HisBasicEdgeUser from '@/apps/work-flow/views/components/ProcessHisFlow/edge/HisBasicEdgeUser.vue';
import HisBasicNodeUser from '@/apps/work-flow/views/components/ProcessHisFlow/node/HisBasicNodeUser.vue';
import { useLayout as useLayoutGraph } from '@/apps/work-flow/views/config/useLayout';
import { useLayout } from '@/common/components/app/composables/layout';

const props = defineProps({
  storeId: {
    type: String,
    default: 'processHistory'
  },
  process: {
    type: Array as PropType<Process[]>,
    required: true
  }
});
const { layout } = useLayoutGraph(props.storeId, 100);
const { layoutConfig } = useLayout();
const { fitView, getNodes, getEdges, fromObject } = useVueFlow(props.storeId);
const { t } = useI18n();
const viewDetailType = ref<'inNode' | 'onHover'>('onHover');
const currentLayOut = ref<'TB' | 'LR'>('LR');

async function layoutGraph(direction: 'TB' | 'LR') {

  // reset(nodes.value)
  currentLayOut.value = direction;
  nodes.value = layout(getNodes.value, getEdges.value, direction);

  await nextTick(() => {
    fitView();
  });
}

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const flowInstanceId = computed(() => {
  return props.process?.length != 0 ? props.process[0]?.flowInstanceId : undefined;
});
watch(flowInstanceId, value => {
  if (!value) {
    return;
  }
  const position: XYPosition = {
    x: 0,
    y: 0,
  };
  loadFlowInstance(value).onResult(res => {
    let {
      nodes: nodeData,
      edges: edgeData,
    } = get(res, 'data.loadFlowInstance', {
      nodes: [] as Node[],
      edges: [] as Edge[]
    });
    //Them data cua quy trinh vao cac node, canh
    // onInit(nodeData,edgeData)
    nodeData = nodeData.map((e: Node) => {
      return {
        ...e,
        data: { ...e.data, },
        type: 'HIS_BASIC_NODE',
        position: position
      };
    });
    edgeData = edgeData.map((e: Edge) => {
      return {
        ...e,
        type: 'HIS_BASIC_EDGE'
      };
    });
    onInit(nodeData, edgeData);
    fromObject({
      position: [0, 0],
      zoom: 0,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      },
      nodes: cloneDeep(nodeData),
      edges: cloneDeep(edgeData)
    }).then(() => fitView());
  });
}, { immediate: true });

function onInit(nodes: Node[], edges: Edge[]) {

  const promise = new Promise<{ nodes: Node[]; edges: Edge[] }>((resolve, reject) => {

    const groupByNode = groupBy(props.process, value => value.stepId);

    const mapNodeProcess: Map<string, NodeProcess> = new Map();
    const nullParentNodes: NodeProcess[] = [];
    const mapNodeId: Map<string, Node> = new Map();
    const mapEdgeId: Map<string, Edge> = new Map();

    // nodes = [...mapNodeId.values()];
    resolve({
      nodes: [...mapNodeId.values()],
      edges: [...mapEdgeId.values()]
    });
  });

  promise.then(({ nodes: nodesData, edges: edgesData }) => {
    edges = edgesData;
  });

}

</script>

<style scoped>

</style>