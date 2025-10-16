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
  <div>
    <OutcomesEditor
      disable-add-outcome
      :node-id='nodeId'></OutcomesEditor>
  </div>
</template>

<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

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

const { findNode } = useVueFlow(props.storeId);
let currNode: GraphNode | undefined = findNode(props.nodeId);
watch(() => props.nodeId, value => {
  currNode = findNode(value);
});

function updateLabel(label: string) {
  updateNodeDataByField(currNode, 'label', label);
}

</script>

<script lang="ts">
export default { name: 'StartNodeEditor' };

</script>

<style scoped>

</style>