<template>
  <HrmListWrapper ref='wrapperRef'>
    <template #tree>
      <HrmEmployeeShiftTree/>
    </template>
    <template #list>
      <HrmEmployeeShiftList/>
    </template>
  </HrmListWrapper>
</template>

<script lang='ts' setup>

import { provide, ref } from 'vue';

import HrmListWrapper from '@/apps/hrm/components/list/HrmListWrapper.vue';
import HrmEmployeeShiftTree from '@/apps/hrm/views/shift/HrmEmployeeShiftTree.vue';
import HrmEmployeeShiftList from '@/apps/hrm/views/shift/list/HrmEmployeeShiftList.vue';

const wrapperRef = ref<InstanceType<typeof HrmListWrapper>>();

function toggleTree() {
  wrapperRef.value?.toggleTree();
}

defineExpose({ toggleTree });

const organizationId = ref<string>();
provide('organizationId', organizationId);
</script>

<style scoped>

</style>