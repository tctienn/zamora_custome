<template>
  <NodeWrapper
    :id='id'
    :edges='edges'
    :editable="!data['notEditable']"
    :error='error'
    :handles='undefined'
    :store-id='storeId'>
    <StartNodeContent/>
  </NodeWrapper>

</template>

<script lang='ts' setup>

import type { GraphEdge } from '@vue-flow/core/dist/types/edge';
import type { ElementData } from '@vue-flow/core/dist/types/flow';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import StartNodeContent from '@/apps/work-flow/views/config/node/content/StartNodeContent.vue';
import NodeWrapper from '@/apps/work-flow/views/config/node/NodeWrapper.vue';
import {
  getEdgesOutgoingFromNode,
  type NodeError,
  useManageNodeProblems,
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
const { t } = useI18n();
const error = computed<NodeError[]>(() => {
  let distinctError: NodeError[] = [];
  const incomingEdges = getEdgesOutgoingFromNode(props.id, props.storeId);
  if (incomingEdges.length < 1) {
    distinctError.push({
      code: 'invalidEdge',
      message: t('work-flow.flow.validate.leastOneOutgoing', { label: props.data?.label })
    });
  }
  return distinctError;
});
useManageNodeProblems(props.id, error);
</script>