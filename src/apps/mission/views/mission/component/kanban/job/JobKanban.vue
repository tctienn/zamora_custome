<template>
  <KanbanView
    class='mt-3'
    :jobs='jobs'>
    <template
      #kanbanItem='{job}'>
      <JobKanbanItem
        :job='job'
        @refresh='refresh'/>
    </template>
  </KanbanView>
</template>

<script setup lang="ts">

import type { PropType } from 'vue';

import type { JobInterface } from '@/apps/mission/model/job/job';

import JobKanbanItem from './JobKanbanItem.vue';
import KanbanView from './KanbanView.vue';

defineProps({
  jobs: {
    type: Array as PropType<JobInterface[]>,
    default: () => []
  }
});

const emits = defineEmits(['refresh']);
function refresh() {
  emits('refresh');
}
</script>

<style scoped>

</style>