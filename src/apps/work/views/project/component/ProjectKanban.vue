<template>
  <KanbanView
    :board-type='BoardType.PROJECT'
    class='mt-3'
    :tasks='projects'>
    <template
      #kanbanItem='{task}'>
      <ProjectKanbanItem
        :is-admin='isAdmin'
        :project='task'
        @refresh='refresh'/>
    </template>
  </KanbanView>
</template>

<script setup lang="ts">

import type { PropType } from 'vue';

import { BoardType } from '@/apps/work/model/board';
import KanbanView from '@/apps/work/views/data/components/kanban/KanbanView.vue';
import ProjectKanbanItem from '@/apps/work/views/project/component/ProjectKanbanItem.vue';
import type { ProjectInterface } from '@/apps/work/views/project/model';

defineProps({
  projects: {
    type: Array as PropType<ProjectInterface[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['refresh']);

function refresh() {
  emits('refresh');
}
</script>

<style scoped>

</style>