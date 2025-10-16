<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    header='Bảng thiết lập'
    :modal='false'
    position='right'
    style='width: 30rem'>

    <component
      :is='getComponent'
      v-bind='getComponentProps'>
    </component>

  </Sidebar>
</template>

<script lang='ts' setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { type Component, ref, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { NodeType } from '@/apps/work-flow/model/flow';
import BasicNodeEditor from '@/apps/work-flow/views/config/sidebar/component/BasicNodeEditor.vue';
import EndNodeEditor from '@/apps/work-flow/views/config/sidebar/component/EndNodeEditor.vue';
import MergeNodeEditor from '@/apps/work-flow/views/config/sidebar/component/MergeNodeEditor.vue';
import SplitNodeEditor from '@/apps/work-flow/views/config/sidebar/component/SplitNodeEditor.vue';
import StartNodeEditor from '@/apps/work-flow/views/config/sidebar/component/StartNodeEditor.vue';
import SubFlowNodeEditor from '@/apps/work-flow/views/config/sidebar/component/SubFlowNodeEditor.vue';

const props = defineProps({
  nodeId: {
    type: String,
    default: ''
  },
  storeId: {
    type: String,
    default: 'main'
  }
});
const { t } = useI18n();
const { findNode, } = useVueFlow(props.storeId);
let currNode: GraphNode | undefined = findNode(props.nodeId);
watch(() => props.nodeId, value => {
  currNode = findNode(props.nodeId);
  if (currNode) {
    getComponentProps.value = {
      nodeId: value,
      storeId: props.storeId
    };
    switch (currNode?.type) {
    case NodeType.START:
      getComponent.value = StartNodeEditor;
      break;
    case NodeType.END:
      getComponent.value = EndNodeEditor;
      break;
    case NodeType.SUB_FLOW:
      getComponent.value = SubFlowNodeEditor;
      break;
    case NodeType.SPLIT:
      getComponent.value = SplitNodeEditor;
      break;
    case NodeType.JOIN:
      getComponent.value = MergeNodeEditor;
      break;
    default:
      getComponent.value = BasicNodeEditor;
    }
  } else {
    visible.value = false;
  }
});

const visible = defineModel('visible', {
  type: Boolean,
  default: false
});

const getComponent = shallowRef<Component>();
const getComponentProps = ref<object>();
</script>

<style lang='scss' scoped>
:deep(.p-sidebar) {
  .p-sidebar-header {
    padding-bottom: 0 !important;
  }
}
</style>