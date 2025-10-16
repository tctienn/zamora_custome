<template>
  <div
    ref='historyContainer'
    class='pr-2'>
    <div
      v-if='taskDeadlineExtension.length>0'
      class='flex flex-column gap-3'>
      <template
        v-for='deadline in taskDeadlineExtension'
        :key='deadline.id'>
        <TaskDeadlineExtensionItem
          :deadline='deadline'>
        </TaskDeadlineExtensionItem>
      </template>
    </div>
    <div
      v-else
      class='flex font-semibold justify-content-center text-lg w-full'>
      Không có gia hạn nào
    </div>
  </div>

</template>

<script lang="ts" setup>
import { nextTick, type PropType, ref, watch } from 'vue';

import type { TaskDeadlineExtension } from '@/apps/work/model/taskDeadlineExtension';
import TaskDeadlineExtensionItem
  from '@/apps/work/views/task/component/detail/deadline-extension/TaskDeadlineExtensionItem.vue';

const props = defineProps({
  taskDeadlineExtension: {
    type: Array as PropType<TaskDeadlineExtension[]>,
    default: () => []
  }
});
const historyContainer = ref<HTMLElement | null>(null);
watch(() => props.taskDeadlineExtension.length, value => {
  nextTick(() => {
    scrollToEnd();
  });
});

const scrollToEnd = () => {
  if (historyContainer.value) {
    historyContainer.value?.scrollTo({
      top: historyContainer.value?.scrollHeight,
      behavior: 'smooth',
    });
  }
};
</script>

<style scoped>

</style>