<template>
  <div class='flex pr-1 tiles w-full'>
    <TaskReportItem
      class='w-full'
      :report='report'>
    </TaskReportItem>
    <div
      class='align-items-center flex flex-column gap-1 mt-5'
      :class='{"hide-buttons":!(report.status == ReportStatus.WAITING_EVALUATE)}'>
      <Button
        v-if='!disableModify'
        v-tooltip='"Đồng ý"'
        class='button'
        icon='pi pi-check-circle'
        style='background-color:#94C748;border:unset'
        @click='acceptReport'>
      </Button>

      <Button
        v-if='!disableModify'
        v-tooltip='"Yêu cầu làm lại"'
        class='button'
        icon='pi pi-chevron-circle-left'
        :outlined='false'
        style='background-color:#F5CD47;border:unset'
        @click='rejectReport'>
      </Button>
    </div>
  </div>

</template>

<script lang='ts' setup>
import { inject, type PropType, ref } from 'vue';

import { EvaluationType } from '@/apps/work/model/taskEvaluation';
import { ReportStatus, type TaskReport } from '@/apps/work/model/taskReport';
import type { AcceptReportEvent, RejectReportEvent } from '@/apps/work/views/task/component/detail/evaluate/type';
import TaskReportItem from '@/apps/work/views/task/component/detail/report/TaskReportItem.vue';

const props = defineProps({
  report: {
    type: Object as PropType<TaskReport>,
    required: true
  }
});
const emits = defineEmits<{
  (e: 'acceptReport', event: AcceptReportEvent): void,
  (e: 'rejectReport', event: RejectReportEvent): void,
}>();
const disableModify = inject('disableModify', ref<boolean>());

function acceptReport() {
  emits('acceptReport', {
    evaluateType: EvaluationType.ACCEPT,
    report: props.report
  });
}

function rejectReport() {
  emits('rejectReport', {
    evaluateType: EvaluationType.REJECT,
    report: props.report
  });
}
</script>

<style scoped>
.tiles:hover {
  .button {
    opacity: 1
  }
}

.button {
  opacity: 0
}

.hide-buttons {
  visibility: hidden;
}
</style>