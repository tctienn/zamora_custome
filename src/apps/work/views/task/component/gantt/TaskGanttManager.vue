<template>
  <GanttTask
    :min-date='minDate'
    :model-value='tasks'>
  </GanttTask>
</template>

<script lang="ts" setup>

import { type PropType, ref } from 'vue';

import type { Task } from '@/apps/work/model/task';
import GanttTask from '@/apps/work/views/component/GanttTask.vue';

const props = defineProps({
  //Prevent warning
  projectId: {
    type: String,
    default: null
  },
  tasks: {
    type: Array as PropType<Task[]>,
    default: () => []
  },
  hideProjectName: {
    type: Boolean,
    default: false
  },
  expandColumn: {
    type: Array as PropType<any>,
    default: [] as []
  },
  isAdminSearch: {
    type: Boolean,
    default: false
  },
  disableByStatus: {
    type: Boolean,
    default: false
  }
});
defineEmits<{
  (e: 'addTaskToPhase', phaseId: string | undefined): void
}>();

const minDate = ref<Date>(new Date());
</script>

<style scoped>

</style>