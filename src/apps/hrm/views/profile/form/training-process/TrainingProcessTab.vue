<template>
  <TrainingProcessTable
    :employee-id='employeeId'
    :snapshot-id='snapshotId'/>
  <CertificateTable
    :employee-id='employeeId'
    :snapshot-id='snapshotId'/>
</template>

<script setup lang="ts">

import CertificateTable from '@/apps/hrm/views/profile/form/training-process/CertificateTable.vue';
import TrainingProcessTable from '@/apps/hrm/views/profile/form/training-process/TrainingProcessTable.vue';

defineProps({
  snapshotId: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  },
});
</script>

<style scoped>

</style>