<template>
  <div
    class='h-full w-full'
    @drop='onDrop'>
    <MyFlow
      id='main'
      :apply-default='false'
      class='work-flow'
      :connection-mode='ConnectionMode.Strict'
      :default-edge-options='{
        markerEnd: MarkerType.ArrowClosed,
        type: "approve",
        updatable: true
      }'
      delete-key-code='Delete'
      :edges='edges'
      :nodes='nodes'
      store-id='main'
      @dragleave='onDragLeave'
      @dragover='onDragOver'>
      <Background
        :gap='16'
        pattern-color='#aaa'/>
      <FlowToolbar
        ref='flowToolBar'
        v-model:flow-name='flowName'
        :is-saving='isSaving'>
      </FlowToolbar>
      <FlowControlToolbar @change-layout='layoutGraph($event)'/>
      <FlowCreatorToolbar/>
      <MiniMap
        mask-color='rgba(0, 0, 0, 0.5)'
        node-color='rgba(160, 160, 160, 0.7)'
        pannable
        :zoom-step='0.5'
        zoomable/>
    </MyFlow>
  </div>

  <NodeEditorSideBar
    v-model:visible='editorVisible'
    :node-id='currentNodeId'/>
</template>

<script lang='ts' setup>
import { Background } from '@vue-flow/background';
import { ConnectionMode, type EdgeChange, MarkerType, type NodeChange, useVueFlow } from '@vue-flow/core';
import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { MiniMap } from '@vue-flow/minimap';
import { cloneDeep, get, pick } from 'lodash';
import { nextTick, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { OrganizationType } from '@/apps/document/model/organization';
import { loadFlow, saveFlowConfig } from '@/apps/work-flow/api/graphql/flow-api';
import { flowType } from '@/apps/work-flow/api/rest/flow-register';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';
import { useHistoryStore } from '@/apps/work-flow/store/editor-history';
import MyFlow from '@/apps/work-flow/views/config/flow/MyFlow.vue';
import NodeEditorSideBar from '@/apps/work-flow/views/config/sidebar/NodeEditorSideBar.vue';
import FlowControlToolbar from '@/apps/work-flow/views/config/toolbar/FlowControlToolbar.vue';
import FlowCreatorToolbar from '@/apps/work-flow/views/config/toolbar/FlowCreatorToolbar.vue';
import FlowToolbar from '@/apps/work-flow/views/config/toolbar/FlowToolbar.vue';
import useDragAndDrop from '@/apps/work-flow/views/config/useDnD';
import { useLayout } from '@/apps/work-flow/views/config/useLayout';
import { confirm } from '@/common/helpers/custom-confirmation-service';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const {
  findNode,
  getNodes,
  getEdges,
  toObject,
  addEdges,
  updateEdge,
  fitView,
  onConnect,
  onNodesChange,
  onEdgesChange,
  onEdgeUpdate,
  applyNodeChanges,
  applyEdgeChanges,
  fromObject
} = useVueFlow('main');

const {
  onDragOver,
  onDrop,
  onDragLeave
} = useDragAndDrop();
const { layout } = useLayout('main');
const {
  backup,
  undo
} = useHistoryStore();
const { t } = useI18n();
const editorVisible = ref(false);
const currentNodeId = ref<string>();
const route = useRoute();
const flowId = route.params.flowId;
const type = ref<FlowType | undefined>();
const orgType = ref<OrganizationType | undefined>();
const nodes = ref<Node[]>();
const edges = ref<Edge[]>();
const flowName = ref<string>(t('work-flow.flow.defaultName'));
onConnect(param => {
  addEdges({ ...param });
});
onEdgeUpdate((e) => updateEdge(e.edge, e.connection));

onNodesChange((changes) => {
  const nextChanges = [];

  for (const change of changes) {
    if (change.type === 'remove') {
      confirm({
        message: t('common.confirmDeleteWithoutName', { itemType: 'Node' }),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          edges.value = getEdges.value.filter(e => !(e.source === change.id || e.target === change.id));
          currentNodeId.value = undefined;
          applyNodeChangesAndBackup([change]);
        }
      });
    } else {
      nextChanges.push(change);
    }
  }
  applyNodeChangesAndBackup(nextChanges);
});

onEdgesChange(async (changes) => {
  const nextChanges = [];
  for (const change of changes) {
    if (change.type === 'remove') {
      confirm({
        message: t('common.confirmDeleteWithoutName', { itemType: 'Edge' }),
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          applyEdgeChangesAndBackup([change]);
        }
      });
    } else {
      nextChanges.push(change);
    }
  }
  applyEdgeChangesAndBackup(nextChanges);
});

function layoutGraph(direction: string) {
  nodes.value = layout(getNodes.value, getEdges.value, direction);
  nextTick(() => {
    fitView();
  });
}

function editNode(nodeId: string) {
  currentNodeId.value = nodeId;
  editorVisible.value = true;
}

function applyNodeChangesAndBackup(changes: NodeChange[]) {
  applyNodeChanges(changes);
  backup(toObject());
}

function applyEdgeChangesAndBackup(changes: EdgeChange[]) {
  applyEdgeChanges(changes);
  backup(toObject());
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 'z') {
    undoChanges();
  }
}

function undoChanges() {
  const state = undo();
  if (state) {
    nodes.value = state.nodes;
    edges.value = state.edges;
  }
}

const {
  mutate: saveFlowConfigMutate,
  loading: isSaving,
  onError: saveConfigError,
  onDone: saveConfigDone
} = saveFlowConfig();

function saveConfig() {
  const nodes = getNodes.value.map(e => {
    return pick(e, ['id', 'data', 'position', 'dimensions', 'handleBounds', 'type']);
  });
  const edges = getEdges.value.map(e => pick(e, ['id', 'source', 'target', 'data', 'sourceX', 'targetX', 'sourceY', 'targetY', 'targetHandle', 'sourceHandle']));

  saveFlowConfigMutate({
    id: flowId,
    flow: {
      nodes: nodes,
      edges: edges,
    }
  }).then(value => {
    toastSuccess({
      message: t('common.result.message.saveSuccess', {
        itemType: t('work-flow.flow.flow'),
        itemName: ''
      })
    });
  })

  ;
}

loadFlow(flowId as string).onResult(param => {
  const {
    nodes: nodeDatas,
    edges: edgeDatas,
    type: typeData,
    name: nameData,
    orgType: orgTypeData
  } = get(param, 'data.loadFlow');
  orgType.value = orgTypeData;
  flowType(typeData).then(value => {
    if (value) {
      type.value = value;
    }
  });
  flowName.value = cloneDeep(nameData);
  fromObject({
    position: [0, 0],
    zoom: 0,
    viewport: {
      x: 0,
      y: 0,
      zoom: 0.5
    },
    nodes: cloneDeep(nodeDatas),
    edges: cloneDeep(edgeDatas)
  }).then(() => fitView( { padding: 0.5 }));
  // const setNodes = new Promise<void>((resolve) => {
  // nodes.value = nodeDatas?.map((node: NodeInputInterface) => ({
  //   ...node,
  //   type: node.type.toLowerCase()
  // }));
  //   resolve();
  // });
  // setNodes.then(() => {
  //   edges.value = edgeDatas?.map((edge: EdgeInputInterface) => edge);
  // });
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown));
const flowToolBar = ref();

function showProblems(event: Event) {
  if (flowToolBar.value) {
    flowToolBar.value.showProblems(event);
  }
}

provide('editNode', editNode);
provide('flowType', type);
provide('orgType', orgType);
provide('findNodeDataMain', findNode);
provide('saveConfig', saveConfig);
provide('showProblems', showProblems);
</script>

<style lang='scss'>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
.work-flow {
  background: #f3f3fe;
}

</style>

<style lang="scss" scoped>
:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--blue-400) !important;
  stroke-width: 1.5px !important;
}
:deep(.vue-flow__edge.updating .vue-flow__edge-path) {
  stroke: var(--blue-400) !important;
  stroke-width: 1.5px !important;
}

:deep(.vue-flow__controls) {
  top: 60px;
}

</style>
