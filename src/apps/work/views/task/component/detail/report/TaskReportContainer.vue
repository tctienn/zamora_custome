<template>
  <div
    class='flex flex-column justify-content-between'
    style='height:calc(100vh - 10rem)'>
    <TaskReportHistory
      class='mb-3 overflow-auto'
      style='height:calc(100vh - 14rem)'
      :task-reports='taskReports'>

    </TaskReportHistory>

    <TaskReportInput
      v-if='!disableModify'
      @send-report='sendReport'>
    </TaskReportInput>
  </div>
</template>

<script lang='ts' setup>
import { computed, inject, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskLazyGraphql } from '@/apps/work/api/graphql/task-api';
import { getTaskReportsByTaskId } from '@/apps/work/api/graphql/task-report';
import { addReport } from '@/apps/work/api/rest/task-report';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import type { TaskReport } from '@/apps/work/model/taskReport';
import TaskReportHistory from '@/apps/work/views/task/component/detail/report/TaskReportHistory.vue';
import TaskReportInput from '@/apps/work/views/task/component/detail/report/TaskReportInput.vue';
import type { SendReportEvent } from '@/apps/work/views/task/component/detail/report/type';
import { DEFAULT_PAGE } from '@/common/constants';
import { toastErrorData } from '@/common/helpers/custom-toast-service';
import type { Edge } from '@/common/model/page';
import { Direction } from '@/common/model/query';

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
});
const { t } = useI18n();
const disableModify = inject('disableModify', ref<boolean>());
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
loadTaskReport();

function createFormReport(event: SendReportEvent): FormData {
  const formData = new FormData();
  formData.append('taskId', props.taskId);
  formData.append('percent', event.percent.toString());
  event.description && formData.append('description', event.description);
  event.attachments && event.attachments.forEach(
    file => {
      formData.append('attachments', file);
    }
  );
  formData.append('weight', '1');

  return formData;
}

function sendReport(event: SendReportEvent) {
  addReport(createFormReport(event)).then(() => {
    refetchTaskReport();
  }).then(() => {
    updatePercentToTask();
  }).catch(e => {
    handleError(e);
  });
}

//Hien thi
function updatePercentToTask() {
  const {
    load,
    refetch,
    onResult
  } = getTaskLazyGraphql(props.taskId);
  load(null, { id: props.taskId })
  || refetch({ id: props.taskId });

  onResult(res => {
  });
}

function handleError(error: Record<string, any>) {
  const data = {
    message: '',
    code: '',
  };
  if ((error?.code as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  }

  if ((error?.code as string).startsWith('checkListNotDone')) {
    data.message = 'Bạn phải hoàn thành check list thì mới có thể gửi báo cáo được.';
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