<template>
  <HrmListWrapper ref='wrapperRef'>
    <template #tree>
      <HrmContractTree/>
    </template>
    <template #list>
      <HrmContractList
        :group-field='groupFieldTable'
        @show:detail="(data: any) => emit('show:detail', data)"/>
      
    </template>
  </HrmListWrapper>
</template>

<script lang='ts' setup>

import { provide, ref } from 'vue';

import HrmListWrapper from '@/apps/hrm/components/list/HrmListWrapper.vue';
import HrmContractList from '@/apps/hrm/views/contract/list/HrmContractList.vue';
import HrmContractTree from '@/apps/hrm/views/contract/list/HrmContractTree.vue';

defineProps({
  groupFieldTable: {
    type: String,
    default: 'all'
  }
});
const emit = defineEmits(['show:detail']);
const wrapperRef = ref<InstanceType<typeof HrmListWrapper>>();
function toggleTree() {
  wrapperRef.value?.toggleTree();
}

const organizationId = ref<string>();
const initialOrganizationId = ref<string>();
provide('organizationId', organizationId);
provide('initialOrganizationId', initialOrganizationId);
defineExpose({ toggleTree });
</script>

<style scoped>

</style>
