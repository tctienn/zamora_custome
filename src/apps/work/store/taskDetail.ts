import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Work } from '@/apps/work/model/task';

export const useTaskDetailStore = defineStore('task-detail', () => {
  const task = ref<Work>({} as Work);

  function clear() {
    task.value = {} as Work;
  }

  return {
    task,
    clear
  };
});