<template>
  <NodeWrapper
    :id='id'
    :edges='edges'
    :editable="!data['notEditable']"
    :error='error'
    :handles='!data["notEditable"]?handles:[]'
    :store-id='storeId'>
    <SubFlowNodeContent
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

import type { Outcome } from '@/apps/work-flow/model/flow';
import SubFlowNodeContent from '@/apps/work-flow/views/config/node/content/SubFlowNodeContent.vue';
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
    style: 'top: 66%'
  },
  {
    id: 'target-bottom-1',
    position: Position.Bottom,
    type: 'target',
    style: 'left: 25%'
  },
  {
    id: 'target-bottom-2',
    position: Position.Bottom,
    type: 'target',
    style: 'left: 75%'
  },
  {
    id: 'target-left',
    position: Position.Left,
    type: 'target',
    style: 'top: 66%'
  },

  {
    id: 'source-top-1',
    position: Position.Top,
    type: 'source',
    style: 'left: 25%'
  },
  {
    id: 'source-top-2',
    position: Position.Top,
    type: 'source',
    style: 'left: 75%'
  },
  {
    id: 'source-right',
    position: Position.Right,
    type: 'source',
    style: 'top: 33%'
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
    style: 'top: 33%'
  },
];
const { t } = useI18n();
const error = computed(() => {
  const distinctOutcomes = new Set(props.data?.outcomes?.map((o: Outcome) => o.name) || []);
  let distinctError: NodeError[] = [];

  if (distinctOutcomes.size != props.data?.outcomes?.length && distinctOutcomes.size != 0) {
    distinctError.push({
      code: 'duplicateOutcome',
      message: t('work-flow.flow.validate.duplicateOutcomes', { label: props.data?.label })
    });
  }
  const lackOutcomes = new Set();
  const fromNodeEdges = getEdgesOutgoingFromNode(props.id, props.storeId).map(e => e.data?.outcome);
  distinctOutcomes.forEach(value => {
    if (!fromNodeEdges.includes(value)) {
      lackOutcomes.add(value);
      distinctError.push({
        code: 'invalidEdge',
        message: t('work-flow.flow.validate.mustHaveOutcome', {
          label: props.data?.label,
          outcome: value
        })
      });
    }
  });
  return distinctError;
});
useManageNodeProblems(props.id, error);
</script>

<style scoped>

</style>