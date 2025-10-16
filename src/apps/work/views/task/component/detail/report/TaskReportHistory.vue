<template>
  <div
    ref='historyContainer'
    class='pr-2'>
    <div
      v-if='taskReports.length>0'
      class='flex flex-column gap-3'>
      <template
        v-for='report in taskReports'
        :key='report.id'>
        <TaskReportItem
          :report='report'>
        </TaskReportItem>
      </template>
    </div>
    <div
      v-else
      class='flex font-semibold justify-content-center text-lg w-full'>
      Không có báo cáo nào
    </div>
  </div>

</template>

<script lang="ts" setup>
import { nextTick, type PropType, ref, watch } from 'vue';

import type { TaskReport } from '@/apps/work/model/taskReport';
import TaskReportItem from '@/apps/work/views/task/component/detail/report/TaskReportItem.vue';

const props = defineProps({
  taskReports: {
    type: Array as PropType<TaskReport[]>,
    default: () => []
  }
});
const historyContainer = ref<HTMLElement | null>(null);
watch(() => props.taskReports.length, value => {
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