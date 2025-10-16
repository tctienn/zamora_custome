<template>
  <Sidebar
    v-model:visible='visible'
    :dismissable='false'
    :header='t("work.task.taskDetail")'
    modal
    position='right'
    :pt="{
      header:{
        class:['pb-2']
      },
    }"
    style='width: 80%;height: 100%'
    @show='readTaskEvent'>
    <TabView
      :active-index='activeIndex'
      lazy
      :pt="{
        navContainer:{
          class:['w-full','fixed'],
          style:[{'z-index':1000}]
        },
        panelContainer:{
          class:['pb-0']
        }
      }">
      <TabPanel
        :pt='ptTabPanel'>
        <template #header>
          {{ t('work.task.generalInformation') }}
        </template>
        <TaskDetailGeneralInfo
          v-if='taskId'
          v-model='task'
          :task-id='taskId'>
        </TaskDetailGeneralInfo>
      </TabPanel>
      <TabPanel
        :pt='ptTabPanel'>
        <template #header>
          {{ t('work.task.taskDocument') }}
        </template>
        <WorkDetailDocument :task-id='taskId'/>
      </TabPanel>
      <TabPanel
        :pt='ptTabPanel'>
        <template #header>
          {{ t('work.task.taskMember') }}
        </template>
        <TaskDetailMember
          :task='task'/>
      </TabPanel>
      <TabPanel
        :pt='ptTabPanel'>
        <template #header>
          {{ t('work.task.taskActivity') }}
        </template>
        <TaskDetailActivity
          v-if='taskId'
          :task-id='taskId'/>
      </TabPanel>
      <TabPanel
        v-for='tab in conditionalTabs'
        :key='tab.key'
        :pt='tab.pt'>
        <template #header>
          <div class='align-items-center flex gap-3'>
            {{ tab.header }}
            <span
              v-if='tab.count'
              v-tooltip='t("work.task.reportTab.reportWaitingEvaluate")'
              class='circle-text'>
              {{ tab.count }}
            </span>
          </div>
        </template>
        <component
          :is='tab.component'
          :task-id='taskId'></component>
      </TabPanel>
      <TabPanel
        :pt='{
          headerAction:{
            class:["p-0","border-none"]
          },
          header:{
            class:["flex","align-items-center"]
          }
        }'>
        <template #header>
          <AppIcon
            class='cursor-pointer font-normal'
            name='expand_circle_down'
            size='1.6'
            @click.stop='menuRef?.toggle($event)'>
          </AppIcon>
          <Menu
            ref='menuRef'
            :model='menuOptions'
            popup>
            <template #itemicon='{item}'>
              <AppIcon
                class='mr-1'
                :name='item.icon'
                size='1.5'>
              </AppIcon>
            </template>
          </Menu>
        </template>
      </TabPanel>
    </TabView>
    <TaskDetailRightCorner
      v-model='task'
      class='button-navbar flex gap-2'
      :task-id='taskId'/>
    <QuickSaveTask
      v-model:visible='visibleQuickSave'
      :parent-task-id='props.taskId'
      @hide-dialog='visibleQuickSave = false'
      @reload='reloadSubTask'/>
    <UpdateDescriptionTask
      v-model:visible='updateDescriptionVisible'
      :description='task?.description'
      :target='task?.target'
      @save='saveUpdateDescription'>
    </UpdateDescriptionTask>
    <TagDialog
      v-model:visible-dialog='tagDialogVisible'
      :selected-labels='task?.labels?.map(e=>({id:e.labelId,labelColor:e.labelColor,labelTitle:e.labelTitle}) as Label) || []'
      @hide-dialog='tagDialogVisible = false'
      @save-label='saveTags'>
    </TagDialog>
  </Sidebar>

</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { type Component, computed, inject, provide, type Ref, ref, shallowRef, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { changeTaskDescription, cloneTask, getTaskLazyGraphql, readTask } from '@/apps/work/api/graphql/task-api';
import { addLabelsToTaskGraphql } from '@/apps/work/api/graphql/task-label-api';
import { countByTaskIdAndReportStatus } from '@/apps/work/api/graphql/task-report';
import { ParticipantType, type Task } from '@/apps/work/model/task';
import type { Label } from '@/apps/work/model/taskLabel';
import { ReportStatus } from '@/apps/work/model/taskReport';
import { useTaskStore } from '@/apps/work/store/task';
import TagDialog from '@/apps/work/views/project/component/detail/TagDialog.vue';
import TaskDetailActivity from '@/apps/work/views/task/component/detail/TaskDetailActivity.vue';
import TaskDetailDeadlineExtend from '@/apps/work/views/task/component/detail/TaskDetailDeadlineExtend.vue';
import TaskDetailEvaluate from '@/apps/work/views/task/component/detail/TaskDetailEvaluate.vue';
import TaskDetailGeneralInfo from '@/apps/work/views/task/component/detail/TaskDetailGeneralInfo.vue';
import TaskDetailMember from '@/apps/work/views/task/component/detail/TaskDetailMember.vue';
import TaskDetailReport from '@/apps/work/views/task/component/detail/TaskDetailReport.vue';
import WorkDetailDocument from '@/apps/work/views/task/component/detail/WorkDetailDocument.vue';
import QuickSaveTask from '@/apps/work/views/task/component/form/QuickSaveTask.vue';
import UpdateDescriptionTask from '@/apps/work/views/task/component/form/UpdateDescriptionTask.vue';
import TaskDetailRightCorner from '@/apps/work/views/task/component/TaskDetailRightCorner.vue';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});
const task = ref<Task>();
const visible = defineModel<boolean>('visible', { default: false });
const activeIndex = defineModel<number>('activeIndex', { default: 0 });

const ptTabPanel = { content: { class: ['mt-7'] } };
const { t } = useI18n();
const { user } = storeToRefs(useUserStore());
const { mutate: readTaskMutate } = readTask();

function readTaskEvent() {
  readTaskMutate({ taskId: props.taskId });
}

const {
  onResult: taskOnResult,
  onError: taskOnError,
  load: taskLoad,
  refetch: taskRefetch
} = getTaskLazyGraphql(props.taskId || '');
taskOnResult((res) => {
  task.value = res.data?.task;
});
taskOnError(error => {
  toastError();
});
watch(() => props.taskId, value => {
  if (value) {
    (taskLoad(null, { id: value }) || taskRefetch({ id: value }))?.then(() => {
      countByTaskIdAndReportStatus(value, ReportStatus.WAITING_EVALUATE).onResult(res => {
        evaluateTab.value.count = res.data?.countByTaskIdAndReportStatus || 0;
      });
    });
  }
}, { immediate: true });

type ConditionalTab = {
  key: string,
  header: string,
  pt: any,
  component: Component,
  count?: number,
}
const reportTab = toRef<ConditionalTab>({
  key: 'report',
  header: t('work.task.reportTab.report'),
  pt: ptTabPanel,
  component: shallowRef(TaskDetailReport),
});
const extendTab = toRef<ConditionalTab>({
  key: 'extend_deadline',
  header: t('work.task.reportTab.extendDeadline'),
  pt: ptTabPanel,
  component: shallowRef(TaskDetailDeadlineExtend),
});
const evaluateTab = toRef<ConditionalTab>({
  key: 'evaluate',
  header: t('work.task.reportTab.evaluate'),
  pt: ptTabPanel,
  component: shallowRef(TaskDetailEvaluate),
});

const conditionalTabs = computed<ConditionalTab[]>(() => {
  const rs: ConditionalTab[] = [];
  if (task.value?.participants?.find(e => e.participantId == user.value.id && e.type == ParticipantType.IMPLEMENTER)) {
    rs.push(reportTab.value);
    rs.push(extendTab.value);
  }
  if (task.value?.assignerId == user.value.id) {
    rs.push(evaluateTab.value);
  }
  return rs;
});
const { canModifyTask } = useTaskStore();

const disableModify = computed(() => {
  return !!task.value && canModifyTask(task.value);
});

provide('disableModify', disableModify);
//
const menuOptions = ref<MenuItem[]>([
  {
    label: 'Thêm nhanh công việc con',
    icon: 'add_circle',
    command(event) {
      quickSaveSubTask();
    },
  }, {
    label: 'Cập nhật mô tả công việc',
    icon: 'edit',
    command(event) {
      updateDescription();
    },
  }, {
    label: 'Nhân bản công việc',
    icon: 'content_copy',
    command(event) {
      cloneTaskCommand();
    },
  }, {
    label: 'Gán nhãn',
    icon: 'sell',
    command(event) {
      addTags();
    },
  },
]);
const menuRef = ref<InstanceType<typeof Menu> | null>(null);

const { mutate: cloneMutate } = cloneTask();

function cloneTaskCommand() {
  cloneMutate({ taskId: props.taskId })
    .then((res) => {
      // emits('editTask', res?.data?.cloneTask?.id);
      toastSuccess({ message: t('Nhân bản thành công') });
    }).then(() => {
      EventBus.emit('refetchMyWork');
    })
    .catch(() => {
      toastError({ message: t('Nhân bản thất bại') });
    });
}

const visibleQuickSave = ref<boolean>(false);

function quickSaveSubTask() {
  if (disableModify.value) {
    toastError({ message: 'Trạng thái công việc đã hoàn thành nên bạn không thể thực hiện thao tác này.' });
    return;
  }
  visibleQuickSave.value = true;
}

function reloadSubTask() {
  EventBus.emit('refetchSubTasks');
}

const tagDialogVisible = ref<boolean>(false);

function addTags() {
  if (disableModify.value) {
    toastError({ message: 'Trạng thái công việc đã hoàn thành nên bạn không thể thực hiện thao tác này.' });
    return;
  }
  tagDialogVisible.value = true;
}

const { mutate: labelsMutate } = addLabelsToTaskGraphql();

function saveTags(labels: Label[]) {
  labelsMutate({
    taskId: props.taskId,
    labels: labels.map(e => ({
      ...e,
      labelId: e.id
    }))
  }).then(res => {
    if (task.value) {
      task.value = {
        ...task.value,
        labels: res?.data?.addLabelsToTask
      };
    }
  });
}

const updateDescriptionVisible = ref<boolean>(false);

function updateDescription() {
  if (disableModify.value) {
    toastError({ message: 'Trạng thái công việc đã hoàn thành nên bạn không thể thực hiện thao tác này.' });
    return;
  }
  updateDescriptionVisible.value = true;
}

const { mutate: descriptionUpdate } = changeTaskDescription();

function saveUpdateDescription(description: string, target: string) {
  descriptionUpdate({
    taskId: props.taskId,
    description: description,
    target: target
  }).then(() => {
    if (task.value) {
      task.value = {
        ...task.value,
        description: description,
        target: target
      };
    }
    toastSuccess({ message: 'Cập nhật mô tả công việc thành công' });
  }).catch(reason => {
    toastError({ message: 'Cập nhật mô tả công việc thất bại' });
  });
}

provide('providedTask', task);
</script>

<style scoped>
.button-navbar {
  position: absolute;
  top: 2.5rem;
  right: 4rem;
  z-index: 1001;
}

.circle-text {
  position: relative;
  display: inline-block;
  color: white;
  z-index: 1
}

.circle-text::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1.7rem; /* Larger width for the circle */
  height: 1.7rem; /* Larger height for the circle */
  border-radius: 50%; /* Makes it a circle */
  pointer-events: none; /* Prevent interaction with the pseudo-element */
  transform: translate(-50%, -50%);
  z-index: -1; /* Keeps the circle behind the text */
  background: #F36F24;
}

</style>