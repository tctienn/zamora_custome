<template>
  <NodeWrapper
    :id='id'
    :edges='edges'
    :editable="!data['notEditable']"
    :error='error'
    :handles='handles'
    :store-id='storeId'>
    <MergeNodeContent
      :id='id'
      editable
      :is-error='error.length>0'
      :label='label'
      :store-id='storeId'/>
  </NodeWrapper>
</template>

<script lang="ts" setup>
import { type HandleProps, Position } from '@vue-flow/core';
import type { GraphEdge } from '@vue-flow/core/dist/types/edge';
import type { ElementData } from '@vue-flow/core/dist/types/flow';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import MergeNodeContent from '@/apps/work-flow/views/config/node/content/MergeNodeContent.vue';
import NodeWrapper from '@/apps/work-flow/views/config/node/NodeWrapper.vue';
import {
  getEdgesOutgoingFromNode,
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
  editable: {
    type: Boolean,
    default: false
  },
  storeId: {
    type: String,
    default: 'main'
  }
});
const { t } = useI18n();
const error = computed<NodeError[]>(() => {
  let distinctError: NodeError[] = [];
  const fromNodeEdges = getEdgesOutgoingFromNode(props.id, props.storeId).map(e => e.data?.outcome);
  if (fromNodeEdges.length != 1) {
    distinctError.push({
      code: 'invalidEdge',
      message: t('work-flow.flow.validate.mustOneOutgoing', { label: props.data?.label })
    });
  }
  if (!props.data?.mergeOption) {
    distinctError.push({
      code: 'invalidJoinNode',
      message: t('work-flow.flow.validate.joinNodeOption', { label: props.data?.label })
    });
  }
  return distinctError;
}
);

useManageNodeProblems(props.id, error);
const handles: HandleProps & { [key: string]: any } [] = [
  {
    id: 'target-top',
    position: Position.Top,
    type: 'target'
  },
  {
    id: 'target-right',
    position: Position.Right,
    type: 'target',
    style: 'top: 33%;left:80%'
  },
  {
    id: 'target-bottom-1',
    position: Position.Bottom,
    type: 'target',
    style: 'left: 24%;top:76%'
  },
  {
    id: 'target-bottom-2',
    position: Position.Bottom,
    type: 'target',
    style: 'left: 79%;top:77%'
  },
  {
    id: 'target-left',
    position: Position.Left,
    type: 'target',
    style: 'top: 33%;left:5%'
  },

  {
    id: 'source-top-1',
    position: Position.Top,
    type: 'source',
    style: 'left: 20%;top:15%'
  },
  {
    id: 'source-top-2',
    position: Position.Top,
    type: 'source',
    style: 'left: 80%;top:15%'
  },
  {
    id: 'source-right',
    position: Position.Right,
    type: 'source',
    style: 'top: 66%;left:80%'
  },
  {
    id: 'source-bottom',
    position: Position.Bottom,
    type: 'source'
  },
  {
    id: 'source-left',
    position: Position.Left,
    type: 'source',
    style: 'top: 66%;left:5%'
  },
];
</script>

<style scoped>

</style>