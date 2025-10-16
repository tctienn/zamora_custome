<template>
  <KanbanView
    :board-type='boardType'
    :tasks='tasks as Work[]'>
    <template
      #kanbanItem='{task}'>
      <TaskKanbanItem
        :disable-by-status='disableByStatus'
        :is-admin-search='isAdminSearch'
        :task='task as Task'/>
    </template>
  </KanbanView>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, type PropType } from 'vue';

import { BoardType } from '@/apps/work/model/board';
import type { Task, Work } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import KanbanView from '@/apps/work/views/data/components/kanban/KanbanView.vue';
import TaskKanbanItem from '@/apps/work/views/task/component/kanban/TaskKanbanItem.vue';

defineProps({
  //Prevent warning
  projectId: {
    type: String,
    default: null
  },
  tasks: {
    type: Array as PropType<Task[]>,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false,
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

const { boardType } = storeToRefs(useTaskStore());

onMounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.add('overflow-hidden');
  }
  boardType.value = BoardType.PERSON;
});

onUnmounted(() => {
  const layoutContent = document.getElementsByClassName('layout-content');
  if (layoutContent?.length) {
    layoutContent[0].classList.remove('overflow-hidden');
  }
});
</script>

<style lang='scss' scoped>
:deep(.kanban) {
  scroll-behavior: smooth;
}

:deep(.kanban-dropzone) {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>