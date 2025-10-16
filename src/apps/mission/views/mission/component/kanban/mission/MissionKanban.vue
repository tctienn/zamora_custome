<template>
  <KanbanView
    class='mt-3'
    :missions='missions'>
    <template
      #kanbanItem='{mission}'>
      <MissionKanbanItem
        :mission='mission'
        @refresh='refresh'/>
    </template>
  </KanbanView>
</template>

<script setup lang="ts">

import type { PropType } from 'vue';

import type { MissionInterface } from '@/apps/mission/model/mission/mission';

import KanbanView from './KanbanView.vue';
import MissionKanbanItem from './MissionKanbanItem.vue';

defineProps({
  missions: {
    type: Array as PropType<MissionInterface[]>,
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