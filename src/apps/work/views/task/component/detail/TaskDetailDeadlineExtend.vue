<template>
  <TaskDeadlineExtensionContainer
    :task-id='taskId'>
    {{ taskId }}
  </TaskDeadlineExtensionContainer>
</template>

<script lang="ts" setup>

import TaskDeadlineExtensionContainer
  from '@/apps/work/views/task/component/detail/deadline-extension/TaskDeadlineExtensionContainer.vue';

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
});
</script>

<style scoped>

</style>