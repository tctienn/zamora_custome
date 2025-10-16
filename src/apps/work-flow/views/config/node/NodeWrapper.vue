<template>
  <div class='node-wrapper relative'>
    <slot></slot>
    <Handle
      v-for='h in handles'
      :key='h.id'
      class='handle-auto-hide'
      :class='classForHandle(h.id, h.type)'
      :connectable='h.connectable||editable'
      :is-valid-connection='isValidConnectionFunc'
      v-bind='h'/>
    <Badge
      v-if='error.length!==0'
      class='absolute cursor-pointer'
      severity='danger'
      style='top:-0.8rem; left: -0.5rem;'
      :value='errorString'
      @mouseleave='toggleError(false)'
      @mouseover='toggleError(true)'>
    </Badge>
    <div
      v-if='editable'
      class='absolute actions flex flex-column'
      style='top:0; right: -1.2rem'>
      <AppIcon
        class='cursor-pointer hover:text-blue-600 text-blue-500'
        name='settings'
        @click='editNode(id)'/>
      <AppIcon
        class='cursor-pointer hover:text-red-600 text-red-500'
        name='delete'
        @click='removeNodes([id])'/>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { Handle, type HandleProps, useVueFlow, type ValidConnectionFunc } from '@vue-flow/core';
import type { Connection } from '@vue-flow/core/dist/types/connection';
import type { GraphEdge } from '@vue-flow/core/dist/types/edge';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { get } from 'lodash';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { type NodeError } from '@/apps/work-flow/views/config/sidebar/component/ValidatorNode';
import AppIcon from '@/common/components/app/AppIcon.vue';

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  handles: {
    type: Array as PropType<HandleProps[]>,
    default: () => [
      {
        id: 'source-top',
        position: 'top',
        type: 'source'
      },
      {
        id: 'source-right',
        position: 'right',
        type: 'source'
      },
      {
        id: 'source-bottom',
        position: 'bottom',
        type: 'source'
      },
      {
        id: 'source-left',
        position: 'left',
        type: 'source'
      }
    ]
  },
  edges: {
    type: Array as PropType<GraphEdge[]>,
    default: () => []
  },
  storeId: {
    type: String,
    default: 'main'
  },
  editable: {
    type: Boolean,
    default: false
  },
  error: {
    type: Array as PropType<NodeError[]>,
    default: () => []
  }
});
const { t } = useI18n();
const errorString = computed(() => fullError.value ? `${props.error.length} ${t('work-flow.flow.error.this')}` : props.error.length.toString());
const fullError = ref(false);

function toggleError(toggle: boolean) {
  fullError.value = toggle;
}

const { removeNodes, findNode } = useVueFlow(props.storeId);
const editNode = inject('editNode', (nodeId: string) => void {});

function classForHandle(handeId?: string, type: 'source' | 'target' = 'source') {
  return {
    'has-connection': props.edges.some((edge) => edge[type] === props.id && get(edge, type + 'Handle') === handeId),
    'bg-blue-600': type === 'source',
    'bg-orange-600': type === 'target'
  };
}

const opacity = computed(() => {
  return props.editable ? 1 : 0;
});

function logError() {
}

const canConnectMore = computed<boolean>(() => {
  const outgoingEdges = props.edges.filter(e => e.source == props.id);
  const outcomes = findNode(props.id)?.data?.outcomes?.length || 0;
  return outgoingEdges.length < outcomes;
});

const isValidConnectionFunc: ValidConnectionFunc = (connection: Connection, elements: {
  edges: GraphEdge[]
  nodes: GraphNode[]
  sourceNode: GraphNode
  targetNode: GraphNode
},) => {
  return canConnectMore.value;
};

const showProblems = inject('showProblems', (event: Event) => void {});
</script>

<style lang="scss" scoped>
.node-wrapper {
  .actions {
    opacity: 0;
  }

  .handle-auto-hide {
    opacity: v-bind(opacity);

    &:not(.has-connection) {
      opacity: 0;
    }
  }

  &:hover {
    .actions {
      opacity: v-bind(opacity);
    }

    .handle-auto-hide {
      opacity: v-bind(opacity);
    }
  }
}

</style>