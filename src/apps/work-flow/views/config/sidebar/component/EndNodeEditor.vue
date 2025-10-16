<template>
  <TabView
    v-model:active-index='activeIndex'
    lazy
    :pt='{
      tabpanel:{
        headerAction:{
          class:"p-3"
        }
      }
    }'>
    <TabPanel :header='t("work-flow.flow.basic")'>
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
    </TabPanel>
    <TabPanel :header='t("work-flow.flow.advanced")'>
      <BasicNodeAdvanced
        :node-id='nodeId'
        :store-id='storeId'>
      </BasicNodeAdvanced>
    </TabPanel>
  </TabView>
</template>

<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import type { GraphNode } from '@vue-flow/core/dist/types/node';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicNodeAdvanced from '@/apps/work-flow/views/config/sidebar/component/AdvancedEditor/BasicNodeAdvanced.vue';
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
const activeIndex = ref<number>(0);
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
export default { name: 'EndNodeEditor' };
</script>

<style scoped>

</style>