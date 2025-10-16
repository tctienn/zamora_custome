<template>
  <div class='field'>
    <label class='font-semibold'>
      {{ t('work-flow.flow.mergeOptions.this') }}
    </label>
    <div class='flex flex-column gap-2'>
      <div class='flex'>
        <RadioButton
          :model-value='node?.data?.mergeOption'
          :value='MergeOption.ALL'
          @update:model-value='updateMergeOption($event)'/>
        <div class='ml-2'>
          <label class='font-semibold'>{{ t("work-flow.flow.mergeOptions.all.short") }}</label>
          <p class='p-ml-3 p-mt-0'>
            {{ t("work-flow.flow.mergeOptions.all.long") }}
          </p>
        </div>
      </div>
      <div class='flex'>
        <RadioButton
          :model-value='node?.data?.mergeOption'
          :value='MergeOption.ANY'
          @update:model-value='updateMergeOption($event)'/>
        <div class='ml-2'>
          <label class='font-semibold'>{{ t("work-flow.flow.mergeOptions.any.short") }}</label>
          <p class='p-ml-3 p-mt-0'>
            {{ t("work-flow.flow.mergeOptions.any.long") }}
          </p>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { MergeOption } from '@/apps/work-flow/model/flow';
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
let node: GraphNode | undefined;
watch(() => props.nodeId, (nodeId) => {
  node = findNode(nodeId);
}, { immediate: true });

const mergeOption = ref<MergeOption>();

function updateMergeOption(value: MergeOption) {
  updateNodeDataByField(node, 'mergeOption', value);
}
</script>

<style scoped>

</style>