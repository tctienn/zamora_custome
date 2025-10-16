<template>
  <div>
    <TaskEvaluateHistory
      class='overflow-auto'
      style='height:calc(100vh - 10rem)'
      :task-reports='taskReports'
      @accept-report='acceptReport'
      @reject-report='rejectReport'>
    </TaskEvaluateHistory>

  </div>

  <TaskEvaluateForm
    v-model:visible='visibleFormEvaluate'
    :evaluate-type='evaluateType'
    :report='currentTaskReport'
    @send-evaluate='sendEvaluate'/>
</template>

<script lang='ts' setup>

import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskLazyGraphql } from '@/apps/work/api/graphql/task-api';
import { getTaskReportsByTaskId, readTasksReport } from '@/apps/work/api/graphql/task-report';
import { addEvaluation } from '@/apps/work/api/rest/task-evaluation';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import { EvaluationType } from '@/apps/work/model/taskEvaluation';
import type { TaskReport } from '@/apps/work/model/taskReport';
import TaskEvaluateForm from '@/apps/work/views/task/component/detail/evaluate/TaskEvaluateForm.vue';
import TaskEvaluateHistory from '@/apps/work/views/task/component/detail/evaluate/TaskEvaluateHistory.vue';
import type {
  EvaluateSendEvent,
  EvaluateType,
  ReportEvent
} from '@/apps/work/views/task/component/detail/evaluate/type';
import { DEFAULT_PAGE } from '@/common/constants';
import { toastError, toastErrorData } from '@/common/helpers/custom-toast-service';
import type { Edge } from '@/common/model/page';
import { Direction } from '@/common/model/query';

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
});
const { t } = useI18n();
const pageable = reactive(
  {
    ...DEFAULT_PAGE,
    size: 9999999,
    sort: [{
      property: 'createdTime',
      direction: Direction.ASC
    }]
  }
);
const {
  result: taskReportResult,
  refetch: refetchTaskReport,
  load: loadTaskReport
} = getTaskReportsByTaskId(props.taskId, pageable);
const taskReports = computed(() => {
  return taskReportResult.value?.getTaskReportsByTaskId?.edges?.map((e: Edge<TaskReport>) => e.node);
});

const visibleFormEvaluate = ref<boolean>(false);

function sendEvaluate(event: EvaluateSendEvent) {
  addEvaluation(createEvaluationForm(event)).then(() => {
    visibleFormEvaluate.value = false;
    refetchTaskReport();
  }).then(() => {
    refetchTaskById(props.taskId);
  }).catch(e => {
    handleError(e);
  });

}

function createEvaluationForm(event: EvaluateSendEvent): FormData {
  const formData = new FormData();
  formData.append('taskId', props.taskId);
  formData.append('reportId', event.report.id);
  formData.append('evaluationType', evaluateType.value);
  event.attachments && event.attachments.forEach(
    file => {
      formData.append('attachments', file);
    }
  );
  event.description && formData.append('description', event.description);
  event.starRating && formData.append('starRating', event.starRating.toString());
  event.percent && formData.append('percent', event.percent.toString());

  return formData;
}

const evaluateType = ref<EvaluateType>(EvaluationType.REJECT);
const currentTaskReport = ref<TaskReport>();

function acceptReport(event: ReportEvent) {
  handleReport(event);
}

function rejectReport(event: ReportEvent) {
  handleReport(event);
}

function handleReport(event: ReportEvent) {
  evaluateType.value = event.evaluateType;
  currentTaskReport.value = event.report;
  visibleFormEvaluate.value = true;
}

function refetchTaskById(taskId: string) {

  if (!taskId) {
    return;
  }
  const {
    load: taskLoad,
    refetch: taskRefetch
  } = getTaskLazyGraphql(taskId || '');

  taskLoad(null, { id: taskId })
  || taskRefetch({ id: taskId });
}

//Read all report
const { mutate: readReport } = readTasksReport();
readReport({ taskId: props.taskId }).then(() => {
  loadTaskReport();
});

function handleError(error: Record<string, any>) {
  const data = {
    message: '',
    code: '',
  };
  if ((error?.code as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  }
  if ((error?.code as string).startsWith('taskAlready')) {
    const statusType: StatusType = (error?.data as Record<string, never>)?.statusType;
    data.message = `Công việc ở trạng thái ${t(`common.statuses.${(statusType as string).toLowerCase()}`)}, không thể thực hiện thao tác`;
  }
  toastErrorData({ error: { data: data } });
}
</script>

<style scoped>

</style>