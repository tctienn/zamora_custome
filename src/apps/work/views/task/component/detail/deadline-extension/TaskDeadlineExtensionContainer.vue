<template>
  <div
    class='flex flex-column justify-content-between'
    style='height:calc(100vh - 10rem)'>
    <TaskDeadlineExtensionHistory
      class='mb-3 overflow-auto'
      style='height:calc(100vh - 14rem)'
      :task-deadline-extension='taskDeadlineExtension'>
    </TaskDeadlineExtensionHistory>
    <TaskDeadlineExtensionInput
      v-if='!disableModify'
      @send-task-deadline-extension='sendTaskDeadlineExtension'>
    </TaskDeadlineExtensionInput>
  </div>
</template>

<script lang='ts' setup>
import { computed, inject, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTaskDeadlineExtensionByTaskId } from '@/apps/work/api/graphql/task-deadline-extension';
import { addTaskDeadlineExtension } from '@/apps/work/api/rest/task-deadline-extension';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import type { SearchDeadlineExtension, TaskDeadlineExtension } from '@/apps/work/model/taskDeadlineExtension';
import TaskDeadlineExtensionHistory
  from '@/apps/work/views/task/component/detail/deadline-extension/TaskDeadlineExtensionHistory.vue';
import TaskDeadlineExtensionInput
  from '@/apps/work/views/task/component/detail/deadline-extension/TaskDeadlineExtensionInput.vue';
import type { SendTaskDeadlineExtensionEvent } from '@/apps/work/views/task/component/detail/deadline-extension/type';
import { DateTimeFormat, DEFAULT_PAGE } from '@/common/constants';
import { toastErrorData } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import { Direction } from '@/common/model/query';

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
});
const disableModify = inject('disableModify', ref<boolean>());
const { moment } = useMoment();
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
const searchModel = reactive<SearchDeadlineExtension>({ taskId: props.taskId });
const {
  result: taskTaskDeadlineExtensionResult,
  refetch: refetchTaskTaskDeadlineExtension,
  load: loadTaskTaskDeadlineExtension
} = getTaskDeadlineExtensionByTaskId(searchModel, pageable);

const taskDeadlineExtension = computed(() => {
  return taskTaskDeadlineExtensionResult.value?.searchDeadlineExtension?.edges?.map((e: Edge<TaskDeadlineExtension>) => e.node) || [];
});
loadTaskTaskDeadlineExtension();

function createFormTaskDeadlineExtension(event: SendTaskDeadlineExtensionEvent): FormData {
  const formData = new FormData();
  formData.append('taskId', props.taskId);
  event?.newDeadline && formData.append('newDeadline', moment(event.newDeadline).format(DateTimeFormat.ISO_LOCAL_DATE_TIME));
  event.reason && formData.append('reason', event.reason);
  event.attachments && event.attachments.forEach(
    file => {
      formData.append('attachments', file);
    }
  );

  return formData;
}

function sendTaskDeadlineExtension(event: SendTaskDeadlineExtensionEvent) {
  addTaskDeadlineExtension(createFormTaskDeadlineExtension(event))
    .then(() => {
      refetchTaskTaskDeadlineExtension();
    }).then(() => {
      updateDeadlineToTask();
    }).catch(e => {
      handleError(e);
    });
}

function updateDeadlineToTask() {

}

function handleError(error: Record<string, any>) {
  const data = {
    message: '',
    code: '',
  };
  if ((error?.code as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  } else if ((error?.code as string).startsWith('taskAlready')) {
    const statusType: StatusType = (error?.data as Record<string, never>)?.statusType;
    data.message = `Công việc ở trạng thái ${t(`common.statuses.${(statusType as string).toLowerCase()}`)}, không thể thực hiện thao tác`;
  } else if ((error?.code as string).startsWith('newDeadlineNotValid')) {
    data.message = 'Ngày kết thúc mới không hợp lệ';
  }
  toastErrorData({ error: { data: data } });
}
</script>

<style scoped>

</style>