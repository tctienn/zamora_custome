<template>
  <div class='flex flex-column'>
    <div
      v-for='(group,idx) in nodeGroups'
      :key='group.id'
      class='flex flex-column'>
      <NodeInDialogGroup
        v-model:group='nodeGroups[idx]'
        :index='idx'
        :node-groups='nodeGroups'
        :view-only='viewOnly'
        @delete-group='deleteGroup(idx)'
        @level-down-group='groupLevelDown(idx)'
        @level-up-group='groupLevelUp(idx)'
        @select-group='selectGroup(idx,$event)'>
      </NodeInDialogGroup>
      <EdgeInDialog
        v-model:map-source-edges='mapSourceEdges'
        :group-id='group.id'
        :show-add-button='!viewOnly && idx!=nodeGroups.length-1'
        :view-only='viewOnly'
        @add-group-at-idx='addGroupAtIdx(idx)'>
      </EdgeInDialog>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { computed } from 'vue';

import EdgeInDialog from '@/apps/document/views/doc/doc-out/component/flow/edge/EdgeInDialog.vue';
import NodeInDialogGroup from '@/apps/document/views/doc/doc-out/component/flow/node/NodeInDialogGroup.vue';

import { type EdgeGroup, type NodeGroup, useFlowTempPrototype } from './config';

defineProps({
  viewOnly: {
    type: Boolean,
    default: false
  },
});
const { getNodeClone, getEdgeClone, getNodeGroupClone, getEdgeGroupClone } = useFlowTempPrototype();

const nodeGroups = defineModel<NodeGroup[]>('nodeGroups', { default: [] });
const edgeGroups = defineModel<EdgeGroup[]>('edgeGroups', { default: [] });
const selectedGroup = defineModel<NodeGroup | undefined>('selectedGroup', { default: undefined });

const mapSourceEdges = computed<Record<string, EdgeGroup>>(() => {
  const rs: Record<string, EdgeGroup> = {};
  edgeGroups.value.forEach(edge => {
    rs[edge.sourceGroup] = edge;
  });
  return rs;
});

function deleteGroup(idx: number) {
  if (selectedGroup.value) {
    const selectedIdx = nodeGroups.value.indexOf(selectedGroup.value);
    if (selectedIdx == idx) {
      selectedGroup.value = undefined;
    }
  }

  const removedGroup = nodeGroups.value.splice(idx, 1)[0];
  edgeGroups.value = edgeGroups.value.filter(e => e.sourceGroup != removedGroup.id);
  const lostTargetEdge = edgeGroups.value.find(e => e.targetGroup == removedGroup.id);
  if (lostTargetEdge) {
    lostTargetEdge.targetGroup = nodeGroups.value[idx].id;
  }

}

function groupLevelDown(idx: number) {
  const groupLevelDown = nodeGroups.value[idx];
  const groupBeSwapped = nodeGroups.value[idx + 1];
  //Swap node
  nodeGroups.value[idx] = groupBeSwapped;
  nodeGroups.value[idx + 1] = groupLevelDown;

  //Dinh huong lai canh
  const edge1 = edgeGroups.value.find(e => e.targetGroup == groupLevelDown.id);
  if (edge1) {
    edge1.targetGroup = groupBeSwapped.id;
  }
  const edge2 = mapSourceEdges.value?.[groupLevelDown.id];
  if (edge2) {
    edge2.targetGroup = groupLevelDown.id;
    edge2.sourceGroup = groupBeSwapped.id;
  }

  const edge3 = mapSourceEdges.value?.[groupBeSwapped.id];
  if (edge3) {
    edge3.sourceGroup = groupLevelDown.id;
  }
}

function groupLevelUp(idx: number) {
  const groupLevelUp = nodeGroups.value[idx];
  const groupBeSwapped = nodeGroups.value[idx - 1];
  //Swap node
  nodeGroups.value[idx] = groupBeSwapped;
  nodeGroups.value[idx - 1] = groupLevelUp;

  //Dinh huong lai canh
  const edge1 = edgeGroups.value.find(e => e.targetGroup == groupBeSwapped.id);
  if (edge1) {
    edge1.targetGroup = groupLevelUp.id;
  }
  const edge2 = mapSourceEdges.value?.[groupBeSwapped.id];
  if (edge2) {
    edge2.sourceGroup = groupLevelUp.id;
    edge2.targetGroup = groupBeSwapped.id;
  }
  const edge3 = mapSourceEdges.value?.[groupLevelUp.id];
  if (edge3) {
    edge3.sourceGroup = groupBeSwapped.id;
  }
}

function addGroupAtIdx(idx: number) {
  const newGroup = getNodeGroupClone();

  const oldGroup = nodeGroups.value[idx];
  const oldGroup2 = nodeGroups.value[idx + 1];
  const newEdgeGroup = getEdgeGroupClone(newGroup.id, oldGroup2.id);

  nodeGroups.value.splice(idx + 1, 0, newGroup);
  //Chuyen huong canh cu
  const oldEdge = edgeGroups.value.find(e => e.sourceGroup == oldGroup.id);
  if (oldEdge) {
    oldEdge.targetGroup = newGroup.id;
  }
  edgeGroups.value = [...edgeGroups.value, newEdgeGroup];
  return newGroup;
}

function selectGroup(idx: number, group: NodeGroup) {
  if (selectedGroup.value) {
    const selectedIdx = nodeGroups.value.indexOf(selectedGroup.value);
    nodeGroups.value[selectedIdx].isSelected = false;
    if (selectedIdx == idx) {
      selectedGroup.value = undefined;
    } else {
      selectedGroup.value = group;
      nodeGroups.value[idx].isSelected = true;
    }
  } else {
    selectedGroup.value = group;
    nodeGroups.value[idx].isSelected = true;
  }
}

defineExpose({ addGroupAtIdx });
</script>