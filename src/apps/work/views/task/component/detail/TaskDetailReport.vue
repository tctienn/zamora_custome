<template>
  <TaskReportContainer
    :task-id='taskId'/>
</template>

<script lang="ts" setup>

import TaskReportContainer from '@/apps/work/views/task/component/detail/report/TaskReportContainer.vue';

defineProps({
  taskId: {
    type: String,
    required: true
  }
});
</script>

<style scoped>

</style>