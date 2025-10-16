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
      <HisBasicNodeProcess
        :id='props.id'
        :data='props.data'
        :source-position='props.sourcePosition'
        :store-id='storeId'
        :target-position='props.targetPosition'
        :view-detail-type='viewDetailType'>

      </HisBasicNodeProcess>
    </template>

    <template #edge-HIS_BASIC_EDGE='edgeProps'>
      <HisBasicEdgeProcess
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
      </HisBasicEdgeProcess>
    </template>

    <Panel
      class='border-1 border-round flex flex-column gap-2 p-2 surface-border'
      :class="{'bg-gray-800':layoutConfig.colorScheme.value==='dark',
               'bg-white':layoutConfig.colorScheme.value==='light'}"
      position='top-left'>
      <div class='align-items-center flex gap-3 justify-content-between'>
        <span>{{ t("document.flowAction.main") }}</span>
        <div
          class='line-legend'
          style='background-color: green'></div>
      </div>
      <div class='align-items-center flex gap-3 justify-content-between'>
        <span>Phối hợp</span>
        <div
          class='line-legend'
          style='background-color: blue'></div>
      </div>
      <div class='align-items-center flex gap-3 justify-content-between'>
        <span>Nhận để biết</span>
        <div
          class='line-legend'
          style='background-color: yellow'></div>
      </div>
    </Panel>

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
import { MarkerType, Panel, useVueFlow, VueFlow } from '@vue-flow/core';
import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { nextTick, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import type { Process } from '@/apps/document/model/process/process';
import {
  createEdge,
  createNode,
  type NodeProcess
} from '@/apps/work-flow/views/components/ProcessHisFlow/constructGraph';
import HisBasicEdgeProcess from '@/apps/work-flow/views/components/ProcessHisFlow/edge/HisBasicEdgeProcess.vue';
import HisBasicNodeProcess from '@/apps/work-flow/views/components/ProcessHisFlow/node/HisBasicNodeProcess.vue';
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
const { t } = useI18n();
const viewDetailType = ref<'inNode' | 'onHover'>('onHover');
const { fitView, getNodes, getEdges } = useVueFlow(props.storeId);
const { layout } = useLayoutGraph(props.storeId, 100);
const { layoutConfig } = useLayout();
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

watch(() => props.process, value => {
  onInit();
}, {
  deep: true,
  immediate: true
});

function onInit() {

  const promise = new Promise<{ nodes: Node[]; edges: Edge[] }>((resolve, reject) => {

    const mapNodeProcess: Map<string, NodeProcess> = new Map();
    const nullParentNodes: NodeProcess[] = [];
    const mapNodeId: Map<string, Node> = new Map();
    const mapEdgeId: Map<string, Edge> = new Map();
    for (let idx = 0; idx < props.process?.length; idx++) {
      const process = props.process[idx];
      if (!process?.id) {
        continue;
      }
      const sendNodeId = `${process?.id}_${process?.senderDeptId}_${process?.senderId}_${process?.senderRoleId}_sender`;
      const receiveNodeId = `${process?.id}_${process?.receiverDeptId}_${process?.receiverId}_${process?.receiverRoleId}_receiver`;
      const { sendNode, receiveNode } = createNode(process, sendNodeId, receiveNodeId);
      //Ghi vao map node process
      //Start
      const newNodeProcess: NodeProcess = {
        process: process,
        sendNode: sendNode,
        receiveNode: receiveNode,
      };
      mapNodeProcess.set(process.id, newNodeProcess);
      //end

      //Kiem tra tien trinh cha co trung nguoi nhan voi nguoi gui tien trinh hien tai khong
      //Neu trung thi khong tao them node nua, khac thi tao them node, tao node xong thi tao canh tuong ung
      const nodeProcessParent = process?.parentId ? mapNodeProcess.get(process.parentId) : undefined;
      if (!nodeProcessParent) {
        let sendNodeParentId = sendNodeId;
        const firstSameUserNode = firstSameUserNullParentNode(nullParentNodes, process);
        if (firstSameUserNode) {
          //Kiem tra xem da tao node gui co phai tu 1 user chua
          sendNodeParentId = firstSameUserNode.sendNode.id;
        } else {
          nullParentNodes.push(newNodeProcess);
          mapNodeId.set(sendNodeId, sendNode);
        }
        //Khong co cha thi la process dau tien
        mapNodeId.set(receiveNodeId, receiveNode);

        const edge1 = createEdge(process, sendNodeParentId, receiveNode.id,);
        mapEdgeId.set(edge1.id, edge1);
        continue;
      }
      if (
        isSameUserDeptRoleProcess(process, nodeProcessParent.process)
      ) {
        //Trung nguoi nhan cua process cha voi nguoi gui cua process con thi chi tao them 1 node nguoi nhan o process con
        mapNodeId.set(receiveNodeId, receiveNode);
        //Noi not vua tao voi not nguoi nhan cua tien trinh cha
        const edge = createEdge(process, nodeProcessParent.receiveNode.id, receiveNodeId);
        mapEdgeId.set(edge.id, edge);
        //Xu ly delegate
        //Neu trung nguoi nhan thi gan them data cho node gui la nguoi duoc uy quyen gui
        nodeProcessParent.receiveNode.data = {
          ...nodeProcessParent.receiveNode.data,
          delegateInfoId: process.delegateInfoId
        };

      } else {
        //Neu khong trung thi phai tao ca hai node o tien trinh hien tai
        mapNodeId.set(sendNodeId, sendNode);
        mapNodeId.set(receiveNodeId, receiveNode);
        //Noi hai node nay lai, noi noi nhan cua tien trinh cha voi not gui cua tien trinh hien tai
        const edge1 = createEdge(process, sendNodeId, receiveNodeId, process.id + 'edge_1');
        //Noi not nhan cua tien trinh cha voi noi gui cua tien trinh con
        const edge2 = createEdge(process, nodeProcessParent.receiveNode.id, sendNodeId, process.id + 'edge_2');
        mapEdgeId.set(edge1.id, edge1);
        mapEdgeId.set(edge2.id, edge2);
        //Xu ly delegate
        //Neu khong trung nhan thi gan them data cho node gui hien la nguoi duoc uy quyen gui
        sendNode.data = {
          ...sendNode.data,
          delegateInfoId: process.delegateInfoId
        };

      }
    }
    nodes.value = [...mapNodeId.values()];
    resolve({
      nodes: [...mapNodeId.values()],
      edges: [...mapEdgeId.values()]
    });
  });

  promise.then(({ nodes: nodesData, edges: edgesData }) => {
    edges.value = edgesData;
  });

}

function isSameUserDeptRoleProcess(senderProcess: Process, receiverProcess: Process) {
  return isSameUserDeptRole(getSender(senderProcess), getReceiver(receiverProcess));
}

function isSameUserDeptRole(user1: UserDeptRoleInput, user2: UserDeptRoleInput) {
  return user1.userId === user2.userId && user1.roleId === user2.roleId && user1.deptId === user2.deptId;
}

function getSender(process: Process): UserDeptRoleInput {
  return {
    userId: process.senderId || '',
    userName: process.senderName || '',
    roleId: process.senderRoleId || '',
    roleName: process.senderRoleName || '',
    deptId: process.senderDeptId || '',
    deptName: process.senderDeptName || '',
    type: OrganizationType.ADMINISTRATIVE,
  };
}

function getReceiver(process: Process): UserDeptRoleInput {
  return {
    userId: process.receiverId || '',
    userName: process.receiverName || '',
    roleId: process.receiverRoleId || '',
    roleName: process.receiverRoleName || '',
    deptId: process.receiverDeptId || '',
    deptName: process.receiverDeptName || '',
    type: OrganizationType.ADMINISTRATIVE,
  };
}

//Dung cho nhung node co parentId null, kiem tra xem nhung not co parentId null xem co chua
function firstSameUserNullParentNode(nodes: NodeProcess[], process: Process) {
  return nodes.find(value => {
    return isSameUserDeptRole(getSender(value.process), getSender(process));
  });
}

defineExpose({ layoutGraph });
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