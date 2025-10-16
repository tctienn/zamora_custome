<template>
  <div class='formgrid grid'>
    <WorkProcessInfo
      v-for='(item, index) in workProcesses'
      :key='index'
      class='col-6'
      :model='item'/>
  </div>
</template>

<script setup lang='ts'>

import { ref } from 'vue';

import { getAllWorkProcessBySnapshotId } from '@/apps/hrm/api/graphql/employee-work-process';
import type { WorkProcess } from '@/apps/hrm/model/employee';
import WorkProcessInfo from '@/apps/hrm/views/profile/detail/component/WorkProcessInfo.vue';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
});
const workProcesses = ref<WorkProcess[]>([]);
const { onResult: getAllWorkProcessBySnapshotIdResult } =
    getAllWorkProcessBySnapshotId(
      props.snapshotId
    );

getAllWorkProcessBySnapshotIdResult((res) => {
  workProcesses.value = res.data.getAllWorkProcessBySnapshotId;
});
</script>

<style scoped>

</style>