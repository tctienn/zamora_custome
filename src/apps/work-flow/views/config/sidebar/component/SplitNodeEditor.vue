<template>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.node.label') }}
    </label>
    <div>
      <InputText
        class='w-full'
        :model-value='currNode?.data["label"]'
        @update:model-value='updateLabel'>
      </InputText>
    </div>
  </div>
  <div class='w-full'>
    <OutcomesEditor
      :generate-outcome='"Split"'
      :node-id='nodeId'
      :store-id='storeId'>
    </OutcomesEditor>
  </div>

</template>

<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { SelectionOption } from '@/apps/work-flow/model/flow';
import OutcomesEditor from '@/apps/work-flow/views/config/sidebar/component/EditorFragment/OutcomesEditor.vue';
import { updateNodeDataByField } from '@/apps/work-flow/views/config/sidebar/UpdateNodeData';

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  storeId: {
    type: String,
    default: 'main'
  }
});
const { t } = useI18n();
const activeIndex = ref<number>(0);
const { findNode } = useVueFlow(props.storeId);
let currNode: GraphNode | undefined;
watch(() => props.nodeId, value => {
  currNode = findNode(value);
  activeIndex.value = 0;
}, { immediate: true });

function updateLabel(label: string) {
  updateNodeDataByField(currNode, 'label', label);
}

const selectionOption = ref<SelectionOption>();
provide('selectionOption', selectionOption);
</script>

<script lang="ts">
export default { name: 'BasicNodeEditor' };
</script>

<style scoped>

</style>