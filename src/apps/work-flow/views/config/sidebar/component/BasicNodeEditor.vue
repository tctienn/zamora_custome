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
      <div class='w-full'>
        <OutcomesEditor
          :node-id='nodeId'
          :store-id='storeId'>
        </OutcomesEditor>
        <OptionEditor
          :node-id='nodeId'
          :store-id='storeId'>
        </OptionEditor>
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
import { provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { SelectionOption } from '@/apps/work-flow/model/flow';
import BasicNodeAdvanced from '@/apps/work-flow/views/config/sidebar/component/AdvancedEditor/BasicNodeAdvanced.vue';
import OptionEditor from '@/apps/work-flow/views/config/sidebar/component/EditorFragment/OptionsEditor.vue';
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