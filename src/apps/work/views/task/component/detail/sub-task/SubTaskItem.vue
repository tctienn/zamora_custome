<template>
  <div class='align-items-center border-round flex hover:surface-hover justify-content-between ml-3 pl-2 tile'>
    <div class='w-4'>
      {{ task.name }}
    </div>
    <div class='w-4'>
      {{ formatDateTime(task.startTime) }} - {{ formatDateTime(task.dueTime) }}
    </div>
    <ProgressBar
      class='h-1rem w-2 w-full'
      :pt='{
        root:{
          class:["bg-orange-400"]
        },
        value:{
          class:["bg-blue-400"]
        }
      }'
      :value='task?.percent||0'/>
    <div class='buttons flex w-1'>
      <ButtonIcon
        v-tooltip='"Chỉnh sửa công việc con"'
        :disabled='disableModify'
        icon='edit'
        round
        text
        @click='showReportDialog'/>

      <ButtonIcon
        v-tooltip='"Xóa công việc con"'
        :disabled='disableModify'
        icon='delete'
        round
        text
        @click='deleteChildTask'/>
    </div>
  </div>

</template>

<script lang='ts' setup>

import type { ApolloError } from '@apollo/client/core';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type Ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteChildrenTask } from '@/apps/work/api/graphql/sub-task-api';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import type { Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import { formatDateTime } from '@/common/helpers/time-util';

const emits = defineEmits<{
  (e: 'refetch'): void,
  (e: 'reportTask', task: Task): void
}>();
const task = defineModel<Task>({ required: true });
const {
  mutate: deleteChildTaskMutate,
  onDone: deleteChildOnDone,
  onError: deleteChildOnError
} = deleteChildrenTask();
const confirm = useConfirm();
const { t } = useI18n();

function deleteChildTask() {
  confirm.require({
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    message: t(`Xác nhận xóa công việc con ${task.value.name}`),
    accept: () => deleteChildTaskMutate({ childrenTaskIds: [task.value.id] })
  });
}

deleteChildOnDone(() => {
  emits('refetch');
  toastSuccess({ message: 'Xóa công việc con thành công' });
});

deleteChildOnError((param) => {
  handleError(param);
});

function showReportDialog() {
  emits('reportTask', task.value);
}

const { canModifyTask } = useTaskStore();
const providedTask = inject<Ref<Task | undefined>>('providedTask', toRef(undefined));
const disableModify = computed(() => {
  return !!providedTask.value && canModifyTask(providedTask.value);
});

function handleError(error: ApolloError) {
  const extension = error.graphQLErrors[0]?.extensions;
  const data = {
    message: 'Xóa công việc con thất bại',
    code: '',
  };
  if ((extension?.errorCode as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  }
  if ((extension?.errorCode as string).startsWith('taskAlready')) {
    const statusType: StatusType = (extension?.errorDetail as Record<string, never>)?.statusType;
    data.message = `Công việc ở trạng thái ${t(`common.statuses.${(statusType as string).toLowerCase()}`)}, không thể thực hiện thao tác`;
  }
  toastErrorData({ error: { data: data } });
}
</script>

<style scoped lang='scss'>
.tile:hover {
  .buttons {
    opacity: 1
  }
}

.buttons {
  opacity: 0
}
</style>