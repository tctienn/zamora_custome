<template>
  <div
    v-if='!isErrored'
    class='h-full w-full'>
    <MyFlow
      id='view'
      :connection-mode='ConnectionMode.Strict'
      :default-edge-options="{
        markerEnd: MarkerType.ArrowClosed,
        type: 'approve',
        updatable: false,
      }"
      :edges='edges'
      :edges-updatable='false'
      :elements-selectable='false'
      fit-view-on-init
      :node-connectable='false'
      :nodes='nodes'
      :nodes-draggable='false'
      store-id='view'>
    </MyFlow>
  </div>
  <div
    v-else
    class='text-center'>Có lỗi xảy ra</div>
</template>

<script lang="ts" setup>
import { ConnectionMode, MarkerType, useVueFlow } from '@vue-flow/core';
import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { get } from 'lodash';
import { ref, watch } from 'vue';

import { loadFlow } from '@/apps/work-flow/api/graphql/flow-api';
import type {
  EdgeInputInterface,
  NodeInputInterface,
} from '@/apps/work-flow/model/flow';
import MyFlow from '@/apps/work-flow/views/config/flow/MyFlow.vue';

const props = defineProps({
  flowId: {
    type: String,
    required: true,
  },
});
const { getConnectedEdges, fitView, fromObject } = useVueFlow('view');
const isErrored = ref<boolean>(false);
const {
  onResult: flowOnResult,
  onError: flowOnError,
  loading: isLoading,
  refetch: flowRefetch,
} = loadFlow(props.flowId);
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const flow = ref(props.flowId);
flowOnResult((param) => {
  const { nodes: nodeDatas, edges: edgeDatas } = get(param, 'data.loadFlow');
  fromObject({
    position: [0, 0],
    zoom: 0,
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    nodes: nodeDatas.map((node: NodeInputInterface) => ({
      ...node,
      data: {
        ...node.data,
        notEditable: true,
      },
    })),
    edges: edgeDatas.map((node: EdgeInputInterface) => ({
      ...node,
      data: {
        ...node.data,
        notEditable: true,
      },
    })),
  }).then(() => {
    isErrored.value = false;
  });
});
flowOnError((param) => {
  isErrored.value = true;
});

watch(
  () => props.flowId,
  (newValue) => {
    flowRefetch({ id: newValue });
  },
);
</script>

<style lang="scss">
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import "@vue-flow/controls/dist/style.css";
</style>
