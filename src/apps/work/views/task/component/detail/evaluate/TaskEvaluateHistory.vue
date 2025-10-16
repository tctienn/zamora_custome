<template>
  <div
    ref='historyContainer'>
    <div
      v-if='taskReports.length>0'
      class='flex flex-column gap-2'>
      <template
        v-for='report in taskReports'
        :key='report.id'>
        <TaskEvaluateItem
          :report='report'
          @accept-report='acceptReport'
          @reject-report='rejectReport'>
        </TaskEvaluateItem>
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
import type { PropType } from 'vue';

import type { TaskReport } from '@/apps/work/model/taskReport';
import TaskEvaluateItem from '@/apps/work/views/task/component/detail/evaluate/TaskEvaluateItem.vue';
import type { AcceptReportEvent, RejectReportEvent } from '@/apps/work/views/task/component/detail/evaluate/type';

const props = defineProps({
  taskReports: {
    type: Array as PropType<TaskReport[]>,
    default: () => []
  }
});
const emits = defineEmits<{
  (e: 'acceptReport', event: AcceptReportEvent): void,
  (e: 'rejectReport', event: RejectReportEvent): void,
}>();
function acceptReport (event: AcceptReportEvent){
  emits('acceptReport', event);
}
function rejectReport(event:RejectReportEvent){
  emits('rejectReport', event);
}
</script>

<style scoped>

</style>