<template>
  <div class='flex flex-column gap-2 hover:border-primary p-inputtext'>
    <div class='flex gap-2 justify-content-between'>
      <div class='align-items-center flex gap-2'>
        <Button
          :disabled='disableFlow'
          size='small'
          @click='visibleDialog=true'>{{ nodes.length === 0 ? t('common.create') : t('common.edit') }}
        </Button>
        <span
          v-if='!showDetail'
          class='font-semibold'>
          {{ t('document.doc.docOut.selfDefineFlow') }}
        </span>
      </div>
      <ButtonIcon
        v-if='nodes.length !== 0'
        :icon='showDetail?"keyboard_arrow_up":"keyboard_arrow_down"'
        text
        @click.stop='showDetail=!showDetail'>
      </ButtonIcon>
    </div>
    <FlowDefineView
      v-if='showDetail'
      v-model:edge-groups='edgeGroupsOriginal'
      v-model:node-groups='nodeGroupsOriginal'
      v-model:selected-node='selectedNode'
      view-only/>
  </div>
  <FlowDefineDialog
    v-model:edge-groups='edgeGroupsOriginal'
    v-model:edges='edges'
    v-model:node-groups='nodeGroupsOriginal'
    v-model:nodes='nodes'
    v-model:visible='visibleDialog'/>
</template>

<script lang='ts' setup>
import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';
import { cloneDeep } from 'lodash';
import { onMounted, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DOC_SUBMIT_FLOW_TYPE } from '@/apps/document/model/flow';
import {
  type EdgeGroup,
  type NodeGroup,
  transformDataToNodeEdgeGroup
} from '@/apps/document/views/doc/doc-out/component/flow/config';
import FlowDefineDialog from '@/apps/document/views/doc/doc-out/component/flow/FlowDefineDialog.vue';
import FlowDefineView from '@/apps/document/views/doc/doc-out/component/flow/FlowDefineView.vue';
import { loadFlow } from '@/apps/work-flow/api/graphql/flow-api';
import { flowType } from '@/apps/work-flow/api/rest/flow-register';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import type { FlowType } from '@/apps/work-flow/model/process/flow-type';

const props = defineProps({
  flowId: {
    type: String,
    default: undefined
  },
  isTemporaryFlow: {
    type: Boolean,
    required: true
  },
  disableFlow: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();
const nodes = defineModel<Node[]>('nodes', { default: () => [] });
const edges = defineModel<Edge[]>('edges', { default: () => [] });

const nodeGroupsOriginal = ref<NodeGroup[]>([]);
const edgeGroupsOriginal = ref<EdgeGroup[]>([]);

const selectedNode = ref<Node | undefined>();
provide('selectedNode', selectedNode);

const selectedGroup = ref<NodeGroup | undefined>();
provide('selectedGroup', selectedGroup);

const visibleDialog = ref<boolean>(false);
const showDetail = ref<boolean>(true);
if (props.flowId && props.isTemporaryFlow) {
  const promise = new Promise<{ nodes: Node[], edges: Edge[] }>((resolve, reject) => {
    if (!props.flowId) {
      reject(false);
    }
    loadFlow(props.flowId || '').onResult((res) => {
      nodes.value = cloneDeep(res.data?.loadFlow?.nodes).map((e: NodeInputInterface) => ({
        ...e,
        data: {
          ...e.data,
          options: {
            ...e.data.options,
            userDeptRoles: [...e.data?.options?.userDeptRoles || []]
          }
        }
      }));
      edges.value = cloneDeep(res.data?.loadFlow?.edges);
      resolve({
        nodes: res.data?.loadFlow?.nodes,
        edges: res.data?.loadFlow?.edges
      });
    });
  });

  promise.then(value => {
    const data = transformDataToNodeEdgeGroup(value.nodes, value.edges);
    nodeGroupsOriginal.value = data.nodeGroups;
    edgeGroupsOriginal.value = data.edgeGroups;
  }
  );
}

const flowConfigType = ref<FlowType>();
onMounted(() => {
  flowType(DOC_SUBMIT_FLOW_TYPE).then(value => {
    if (value) {
      flowConfigType.value = value;
    }
  });
});

provide('flowConfigType', flowConfigType);
</script>

<script lang="ts">
export default { name: 'DocSubmitFlowDefine' };

</script>

<style lang='scss'>

.container {
  overflow: hidden;
}

.container:hover {
  overflow: auto;
}
</style>