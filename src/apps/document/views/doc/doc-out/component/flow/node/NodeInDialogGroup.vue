<template>
  <div
    class='border-1 border-round flex gap-2 group-hover p-2 surface-border'
    @click="emits('selectGroup',group)">
    <div class='flex gap-2 horiz-scroll justify-content-around w-full'>
      <NodeInDialog
        v-for='(node,idx) in group.nodes'
        :key='idx'
        v-model:label='node.data.label'
        v-model:node-data='node.data'
        :index='idx'
        :index-group='index'
        :is-selected='selectedNode?.id===node.id'
        :node-groups='nodeGroups'
        :view-only='viewOnly'
        @delete-node='deleteNode(idx)'
        @level-down="emits('levelDownGroup')"
        @level-up="emits('levelUpGroup')"
        @select-node='selectNode(idx)'/>
    </div>
    <div
      class='align-items-start buttons-group flex flex-column gap-2 transition-duration-500'
      style='top: 0; right: 0'>
      <div
        v-if='!isStartEndGroup && !viewOnly'>
        <div class='flex'>
          <AppIcon
            v-tooltip="t('Chuyển nốt lên trên')"
            class='cursor-pointer hover:surface-hover p-2'
            :class='{"p-disabled": index===1}'
            name='keyboard_arrow_up'
            size='1.5'
            @click.stop='emits("levelUpGroup")'/>
          <AppIcon
            v-tooltip="t('Chuyển nốt xuống dưới')"
            class='cursor-pointer hover:surface-hover p-2'
            :class='{"p-disabled": index===nodeGroups?.length - 2}'
            name='keyboard_arrow_down'
            size='1.5'
            @click.stop='emits("levelDownGroup")'/>
        </div>
        <div class='flex'>
          <AppIcon
            v-tooltip='"Thêm nốt song song"'
            class='cursor-pointer hover:surface-hover p-2'
            name='add'
            size='1.5'
            @click.stop='handleAddNode'>
          </AppIcon>
          <AppIcon
            v-tooltip='t("common.delete")'
            class='cursor-pointer hover:surface-hover p-2'
            name='delete'
            size='1.5'
            @click.stop='emits("deleteGroup")'/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { Node } from '@vue-flow/core/dist/types/node';
import { computed, inject, type PropType, type Ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { type NodeGroup, useFlowTempPrototype } from '@/apps/document/views/doc/doc-out/component/flow/config';
import NodeInDialog from '@/apps/document/views/doc/doc-out/component/flow/node/NodeInDialog.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  nodeGroups: {
    type: Array as PropType<NodeGroup[]>,
    default: () => []
  },
  index: {
    type: Number,
    required: true
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits<{
  (e: 'deleteGroup'): void
  (e: 'levelUpGroup'): void
  (e: 'levelDownGroup'): void
  (e: 'addNode'): void
  (e: 'selectGroup', group: NodeGroup): void
}>();
const group = defineModel<NodeGroup>('group', { required: true });
const { getNodeClone } = useFlowTempPrototype();
const { t } = useI18n();
const isStartEndGroup = computed(() => {
  return props.index == 0 || props.index == props.nodeGroups?.length - 1;
});

function handleAddNode() {
  group.value.nodes.push(getNodeClone());
  // group.value = {
  //   ...group.value,
  //   nodes: [...group.value.nodes, getNodeClone()]
  // };
}

function deleteNode(idx: number) {
  group.value?.nodes.splice(idx, 1);
}

const selectedNode = inject<Ref<Node | undefined>>('selectedNode', toRef(getNodeClone()));

function selectNode(idx: number) {
  const willBeSelect = group.value.nodes[idx];
  if (willBeSelect.id == selectedNode.value?.id) {
    selectedNode.value = undefined;
  } else {
    selectedNode.value = group.value.nodes[idx];
  }
}
</script>

<style scoped>
.is-selected {
  border-color: var(--primary-color) !important;
}

.group-hover:hover {
  border-color: var(--primary-color) !important;

  .buttons-group {
    opacity: 1
  }
}

.buttons-group {
  opacity: 0
}

.horiz-scroll {
  overflow: hidden;
}

.horiz-scroll:hover {
  overflow: auto
}
</style>