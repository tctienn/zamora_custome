<template>
  <ContextMenu
    ref='actionMenu'
    :model='menus'>
    <template #item='{item: {icon, label}}'>
      <a class='flex p-menuitem-link'>
        <AppIcon
          class='p-menuitem-icon'
          :name='icon || ""'
          size='1.5'/>
        {{ label }}
      </a>
    </template>
  </ContextMenu>

  <TaskSetting
    v-if='showDialog === LIST_DIALOG_MY_WORK.SETTING'
    :task='currentTask'
    :visible-dialog='showDialog === LIST_DIALOG_MY_WORK.SETTING'
    @hide-dialog='showDialog = ""'/>
  <WorkDetail
    v-if='workDetailDialogVisible'
    :dialog-visible='workDetailDialogVisible'
    :task='currentTask'
    @hide-dialog='workDetailDialogVisible = false'/>

  <HistoryDialog
    v-if='showDialog === LIST_DIALOG_MY_WORK.HISTORY'
    :task='currentTask'
    :visible-dialog='showDialog === LIST_DIALOG_MY_WORK.HISTORY'
    @hide-dialog='showDialog = ""'/>

  <UpdateResultDialog
    v-if='showDialog === LIST_DIALOG_MY_WORK.UPDATE_RESULT'
    :item='currentTask'
    :visible-dialog='showDialog === LIST_DIALOG_MY_WORK.UPDATE_RESULT'
    @hide-dialog='showDialog = ""'/>

  <EvaluateResultDialog
    v-if='showDialog === LIST_DIALOG_MY_WORK.EVALUATE'
    :task-id='currentTask.id || ""'
    :task-name='currentTask.name || ""'
    :visible-dialog='showDialog === LIST_DIALOG_MY_WORK.EVALUATE'
    @hide-dialog='showDialog = ""'/>

  <ExpenseDialog
    v-if='showDialog === LIST_DIALOG_MY_WORK.EXPENSE'
    :item='currentTask'
    :visible-dialog='showDialog === LIST_DIALOG_MY_WORK.EXPENSE'
    @hide-dialog='showDialog = ""'/>
  <DeadlineDialog
    v-if='showDialog === LIST_DIALOG_MY_WORK.DEADLINE'
    :item='currentTask'
    :visible-dialog='showDialog === LIST_DIALOG_MY_WORK.DEADLINE'
    @hide-dialog='showDialog = ""'/>

  <SaveWork
    v-if='showDialog === LIST_DIALOG_MY_WORK.COPY'
    :dialog-visible='showDialog === LIST_DIALOG_MY_WORK.COPY'
    :item='currentTask'
    @hide-dialog='showDialog = ""'
    @reload='EventBus.emit("refetchMyWork")'/>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteTaskGraphql, getTaskGraphql } from '@/apps/work/api/graphql/task-api';
import { LIST_DIALOG_MY_WORK } from '@/apps/work/constants/myWorkDialogs';
import { TaskAction } from '@/apps/work/model/permission';
import type { Task, Work } from '@/apps/work/model/task';
import { useTaskPermissionStore } from '@/apps/work/store/task_permission';
import { useTaskDetailStore } from '@/apps/work/store/taskDetail';
import DeadlineDialog from '@/apps/work/views/actions/components/dialogs/DeadlineDialog.vue';
import EvaluateResultDialog from '@/apps/work/views/actions/components/dialogs/EvaluateResultDialog.vue';
import ExpenseDialog from '@/apps/work/views/actions/components/dialogs/ExpenseDialog.vue';
import HistoryDialog from '@/apps/work/views/actions/components/dialogs/HistoryDialog.vue';
import TaskSetting from '@/apps/work/views/actions/components/dialogs/TaskSetting.vue';
import UpdateResultDialog from '@/apps/work/views/actions/components/dialogs/UpdateResultDialog.vue';
import SaveWork from '@/apps/work/views/actions/SaveWork.vue';
import WorkDetail from '@/apps/work/views/actions/WorkDetail.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';

const { t } = useI18n();
const confirm = useConfirm();

const workDetailDialogVisible = ref(false);

const allMenus: MenuItem[] = [
  {
    key: 'detail',
    label: t('work.contextMenu.detail'),
    icon: 'info',
    command: openTaskDetail
  },
  // {
  //   key: 'edit',
  //   label: t('work.contextMenu.edit'),
  //   icon: 'edit',
  //   command: event => console.log(currentTask.value)
  // },
  {
    key: 'copy',
    label: t('work.contextMenu.copy'),
    icon: 'content_copy',
    functionPermission: TaskAction.COPY,
    command: () => showDialog.value = LIST_DIALOG_MY_WORK.COPY
  },
  {
    key: 'history',
    label: t('work.contextMenu.history'),
    icon: 'work_history',
    functionPermission: TaskAction.VIEW_HISTORY,
    command: () => showDialog.value = LIST_DIALOG_MY_WORK.HISTORY
  },
  {
    key: 'taskSetting',
    label: t('work.contextMenu.taskSetting'),
    icon: 'settings',
    functionPermission: TaskAction.CONFIGURE,
    command: () => showDialog.value = LIST_DIALOG_MY_WORK.SETTING
  },
  {
    key: 'progress',
    label: t('work.contextMenu.progress'),
    icon: 'clock_loader_20',
    functionPermission: TaskAction.UPDATE_RESULT,
    command: () => showDialog.value = LIST_DIALOG_MY_WORK.UPDATE_RESULT
  },
  {
    key: 'extend',
    label: t('work.contextMenu.extend'),
    icon: 'expand_all',
    functionPermission: TaskAction.CHANGE_DEADLINE,
    command: () => showDialog.value = LIST_DIALOG_MY_WORK.DEADLINE
  },
  {
    key: 'evaluate',
    label: t('work.contextMenu.evaluate'),
    icon: 'approval_delegation',
    functionPermission: TaskAction.EVALUATE,
    command: () => showDialog.value = LIST_DIALOG_MY_WORK.EVALUATE
  },
  {
    key: 'expense',
    label: t('work.contextMenu.expense'),
    icon: 'payments',
    functionPermission: TaskAction.UPDATE_EXPENSE,
    command: () => showDialog.value = LIST_DIALOG_MY_WORK.EXPENSE
  },
  {
    key: 'delete',
    label: t('work.contextMenu.delete'),
    icon: 'delete',
    functionPermission: TaskAction.DELETE,
    command: confirmDeleteTask
  }
];

const menus = ref();
const actionMenu = ref();
const currentTask = ref<Task>({} as Task);
const showDialog = ref('');
const permissionStore = useTaskPermissionStore();

function toggleMenu(event: Event, task: Task) {
  permissionStore.getPermissionsForTask(task.id || '').then(res => {
    menus.value = allMenus.filter(m => !m.functionPermission || m.functionPermission
        && permissionStore.hasPermission(task.id || '', m.functionPermission));
  });
  currentTask.value = task;
  actionMenu.value.show(event);
}

function hideMenu() {
  if (actionMenu.value.visible) {
    actionMenu.value.hide();
  }
}

function openTaskDetail(event: MenuItemCommandEvent) {
  getTaskGraphql(currentTask.value.id || '')
    .onResult(a => {
      useTaskDetailStore().task = cloneDeep<Work>(a.data.task);
      workDetailDialogVisible.value = true;
    });
}

function confirmDeleteTask() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('work.objectName'),
      itemName: currentTask.value.name
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteTask();
    }
  });
}

const {
  mutate: deleteTaskMutate,
  onDone: deleteTaskOnDone,
  onError: deleteTaskOnError
} = deleteTaskGraphql();
deleteTaskOnDone(() => {
  workDetailDialogVisible.value = false;
  EventBus.emit('refetchMyWork');
  toastSuccess({ message: t('common.result.message.deleteSuccess') });
});
deleteTaskOnError(e => {
  toastError();
});

function deleteTask() {
  deleteTaskMutate({ taskId: currentTask.value.id });
}

onMounted(() => {
  EventBus.on('showActionDialog', showActionDialog);
});
onUnmounted(() => {
  EventBus.off('showActionDialog', showActionDialog);
});

function showActionDialog(dialog: string) {
  showDialog.value = dialog;
  if (showDialog.value === LIST_DIALOG_MY_WORK.DELETE) {
    confirmDeleteTask();
  }
}

defineExpose({
  toggleMenu,
  hideMenu
});
</script>

<script lang='ts'>
export default { name: 'TaskActionMenu' };
</script>

<style scoped>

</style>