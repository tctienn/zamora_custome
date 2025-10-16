<template>
  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
</template>

<script lang='ts' setup>

import type Menu from 'primevue/menu';
import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { cloneTask, deleteTaskGraphql } from '@/apps/work/api/graphql/task-api';
import type { Task } from '@/apps/work/model/task';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const emits = defineEmits<{
  (e: 'editTask', taskId: string): void
}>();
const { t } = useI18n();
const menuAction = ref<InstanceType<typeof Menu> | null>(null);
const selectedTask = ref<Task>();

function toggleActionMenu(event: Event, task: Task) {
  menuAction.value?.toggle(event);
  selectedTask.value = task;
}

const menuActions = [
  {
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editWorkHandle();
    }
  },
  {
    label: t('common.clone'),
    icon: 'content_copy',
    command: () => {
      cloneWorkHandle();
    }
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      deleteTaskHandle();
    }
  },
];

//MENU ACTION
const { mutate: cloneMutate } = cloneTask();
const {
  mutate: deleteMutate,
  onError: deleteOnError,
  onDone: deleteOnDone
} = deleteTaskGraphql();

function cloneWorkHandle() {
  cloneMutate({ taskId: selectedTask.value?.id })
    .then((res) => {
      emits('editTask', res?.data?.cloneTask?.id);
      toastSuccess({ message: t('Nhân bản thành công') });
    }).then(() => {
      EventBus.emit('refetchMyWork');
    })
    .catch(() => {
      toastError({ message: t('Nhân bản thất bại') });
    });
}

const confirm = useConfirm();

function deleteTaskHandle() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('work.task.task').toLowerCase(),
      itemName: selectedTask.value?.name
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteMutate({ taskId: selectedTask.value?.id });
    }
  });
}

deleteOnError(error => {
  let message = t('Xóa công việc thất bại');
  const errorCode = error.graphQLErrors[0].extensions?.errorCode;
  if (errorCode == 'notAllow') {
    message = 'Không có quyền xoá công việc này';
  }
  toastError({ message: message });
});
deleteOnDone(param => {
  toastSuccess({ message: t('Xóa công việc thành công') });
  EventBus.emit('refetchMyWork');
});

function editWorkHandle() {
  emits('editTask', selectedTask.value?.id || '');
}

defineExpose({ toggleActionMenu });
</script>

<style scoped>

</style>