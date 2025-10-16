<template>
  <KanbanView
    :board-type='boardType'
    :tasks='tasks'>
  </KanbanView>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, type PropType } from 'vue';

import { BoardType } from '@/apps/work/model/board';
import type { Work } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import KanbanView from '@/apps/work/views/data/components/kanban/KanbanView.vue';

defineProps({
  tasks: {
    type: Array as PropType<Work[]>,
    required: true
  }
});

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

<script lang='ts'>
export default { name: 'WorkDataKanbanView' };
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