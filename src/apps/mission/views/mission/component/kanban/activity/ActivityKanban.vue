<template>
  <KanbanView
    :activitys='activitys'
    class='mt-3'>
    <template
      #kanbanItem='{activity}'>
      <ActivityKanbanItem
        :activity='activity'
        @refresh='refresh'/>
    </template>
  </KanbanView>
</template>

<script setup lang="ts">

import type { PropType } from 'vue';

import type { ActivityInterface } from '@/apps/mission/model/activity/activity';

import ActivityKanbanItem from './ActivityKanbanItem.vue';
import KanbanView from './KanbanView.vue';

defineProps({
  activitys: {
    type: Array as PropType<ActivityInterface[]>,
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