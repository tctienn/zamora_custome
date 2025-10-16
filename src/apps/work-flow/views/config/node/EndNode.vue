<template>
  <NodeWrapper
    :id='id'
    :edges='edges'
    :editable="!data['notEditable']"
    :error='error'
    :handles='handles'
    :store-id='storeId'>
    <EndNodeContent
      :id='id'
      :editable="!data['notEditable']"
      :label='label'
      :store-id='storeId'>
    </EndNodeContent>
  </NodeWrapper>
</template>

<script lang='ts' setup>
import { type HandleProps, Position } from '@vue-flow/core';
import type { GraphEdge } from '@vue-flow/core/dist/types/edge';
import type { ElementData } from '@vue-flow/core/dist/types/flow';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import EndNodeContent from '@/apps/work-flow/views/config/node/content/EndNodeContent.vue';
import NodeWrapper from '@/apps/work-flow/views/config/node/NodeWrapper.vue';
import {
  getEdgesIncomingToNode,
  type NodeError,
  useManageNodeProblems
} from '@/apps/work-flow/views/config/sidebar/component/ValidatorNode';

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  data: {
    type: Object as PropType<ElementData>,
    default: () => ({})
  },
  edges: {
    type: Array as PropType<GraphEdge[]>,
    default: () => []
  },
  storeId: {
    type: String,
    default: 'main'
  }
});

const handles: HandleProps[] = [
  {
    id: 'target-top',
    position: Position.Top,
    type: 'target',
  },
  {
    id: 'target-right',
    position: Position.Right,
    type: 'target'
  },
  {
    id: 'target-bottom',
    position: Position.Bottom,
    type: 'target'
  },
  {
    id: 'target-left',
    position: Position.Left,
    type: 'target'
  }
];
const { t } = useI18n();
const error = computed(() => {
  let distinctError: NodeError[] = [];
  const incomingEdges = getEdgesIncomingToNode(props.id, props.storeId);
  if (incomingEdges.length < 1) {
    distinctError.push({
      code: 'invalidEdge',
      message: t('work-flow.flow.validate.leastOneIncoming', { label: props.data?.label })
    });
  }
  return distinctError;
});
useManageNodeProblems(props.id, error);
</script>