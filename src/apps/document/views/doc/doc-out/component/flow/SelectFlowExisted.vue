<template>
  <Dropdown
    v-model='modelValue'
    class='w-full'
    :disabled='disableFlow'
    filter
    option-label='name'
    option-value='id'
    :options='options'
    @update:model-value='updateFlowName'/>
  <ButtonIcon
    v-tooltip.left="'Xem quy trình xử lý'"
    class='border-round-sm justify-content-center ml-2 px-2'
    :disabled='!modelValue'
    icon='family_history'
    size='1.5'
    style='min-width: 2.7rem;'
    @click='isShowFlowDialog=true'></ButtonIcon>

  <Dialog
    v-model:visible='isShowFlowDialog'
    :block-scroll='true'
    content-class='overflow-hidden'
    :dismissable-mask='true'
    :header='flowNameMap[modelValue]'
    modal>
    <div style='height: 80vh; width: 80vw'>
      <WorkFlowView
        :flow-id='modelValue'
        style='height: 80vh; width: 80vw'>
      </WorkFlowView>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>

import { type PropType, ref } from 'vue';

import type { FlowInterface } from '@/apps/work-flow/model/flow';
import WorkFlowView from '@/apps/work-flow/views/config/sidebar/component/WorkFlowView.vue';

const props = defineProps({
  options: {
    type: Array as PropType<FlowInterface[]>,
    default: () => []
  },
  disableFlow: {
    type: Boolean,
    default: false
  }
});
const modelValue = defineModel<string>({ default: undefined });
const flowNameMap = ref<Record<string, string>>({});

const isShowFlowDialog = ref<boolean>(false);

function updateFlowName(id: string) {
  if (flowNameMap.value[id]) {
    return;
  }
  const flow = props.options.find((e) => e.id == id);
  if (flow) {
    flowNameMap.value = {
      ...flowNameMap.value,
      [id]: flow.name,
    };
  }
}

</script>

<style scoped>

</style>