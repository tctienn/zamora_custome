<template>
  <TaskEvaluateContainer :task-id='taskId'/>
</template>

<script lang="ts" setup>

import TaskEvaluateContainer from '@/apps/work/views/task/component/detail/evaluate/TaskEvaluateContainer.vue';
defineProps({
  taskId: {
    type: String,
    required: true
  }
});

</script>

<style scoped>

</style>