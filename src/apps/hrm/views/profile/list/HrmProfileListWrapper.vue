<template>
  <HrmListWrapper ref='wrapperRef'>
    <template #tree>
      <HrmProfileTree
        class='h-full'
        style='background-color: var(--surface-e)'/>
    </template>
    <template #list>
      <HrmProfileList/>
    </template>
  </HrmListWrapper>
</template>

<script lang='ts' setup>

import { provide, ref } from 'vue';

import HrmListWrapper from '@/apps/hrm/components/list/HrmListWrapper.vue';
import { EmployeeSnapshotStatus } from '@/apps/hrm/model/employee';
import HrmProfileList from '@/apps/hrm/views/profile/list/HrmProfileList.vue';
import HrmProfileTree from '@/apps/hrm/views/profile/list/HrmProfileTree.vue';

const wrapperRef = ref<InstanceType<typeof HrmListWrapper>>();

function toggleTree() {
  wrapperRef.value?.toggleTree();
}

const organizationId = ref<string>();
const snapshotStatus = ref<EmployeeSnapshotStatus>(EmployeeSnapshotStatus.ACTIVE);
const setOrganizationId = (newId: string) => {
  organizationId.value = newId;
};
const initialOrganizationId = ref<string>();
provide('organizationId', organizationId);
provide('snapshotStatus', snapshotStatus);
provide('initialOrganizationId', initialOrganizationId);
provide('setOrganizationId', setOrganizationId);

defineExpose({ toggleTree });
</script>

<style scoped>

</style>
