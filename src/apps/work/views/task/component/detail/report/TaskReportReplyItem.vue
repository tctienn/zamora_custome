<template>
  <TaskEvaluateReplyItem :evaluation='report.taskEvaluation'>
    <template
      v-if='report.status!=ReportStatus.EVALUATED'
      #percent-rate>
      <span></span>
    </template>
  </TaskEvaluateReplyItem>
</template>

<script lang="ts" setup>

import { computed, type PropType } from 'vue';

import { ReportStatus, type TaskReport } from '@/apps/work/model/taskReport';
import TaskEvaluateReplyItem from '@/apps/work/views/task/component/detail/evaluate/TaskEvaluateReplyItem.vue';

const props = defineProps({
  report: {
    type: Object as PropType<TaskReport>,
    default: () => ({})
  }
});

const backgroundColor = computed(() => {
  switch (props.report.status) {
  case ReportStatus.EVALUATED:
    return '#EFFAFE';
  case ReportStatus.REQUEST_RE_REPORT:
    return '#FCF2F2';
  case ReportStatus.WAITING_EVALUATE:
    return '#FFFFFF';
  case ReportStatus.RE_REPORTED:
    return '#FCF2F2';
  }
});
</script>

<style scoped>
:deep(.task-evaluate-item) {
  background-color: v-bind(backgroundColor)
}
</style>