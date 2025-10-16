<template>
  <div class='align-items-center flex gap-2'>
    <span class='font-semibold text-primary'>
      {{ title }}
    </span>
    <slot
      :add-sub-task='addSubTask'
      name='add-group-button-icon'>
      <ButtonIcon
        v-tooltip='"Thêm mới công việc con"'
        :disabled='disableModify'
        icon='add_circle'
        round
        text
        @click='addNewSubTask'>
      </ButtonIcon>

      <ButtonIcon
        v-tooltip='"Thêm công việc con"'
        :disabled='disableModify'
        icon='add'
        round
        text
        @click='addSubTask'>
      </ButtonIcon>
    </slot>
  </div>
  <div class='ml-3'>
    <div>
      <template
        v-for='(task,index) in subTasks'
        :key='task.id'>
        <SubTaskItem
          v-model='subTasks[index]'
          @refetch='refetchSubTasks'
          @report-task='reportTaskFun'/>
      </template>
    </div>
  </div>
  <SubTaskDialog
    v-model='subTasks'
    v-model:visible='visibleDialog'
    :task-id='taskId'
    @refetch='refetchSubTasks'/>
  <ReportTask
    v-model:visible='reportVisible'
    :sub-task='reportTaskVar'>
  </ReportTask>
  <SaveTask
    v-model:visible='visibleForm'
    :parent-task-id='taskId'
    :task-id='subTaskId'
    @hide-dialog='hideForm'
    @reload='refetchSubTasks'>
  </SaveTask>
</template>

<script lang='ts' setup>
import { computed, inject, onMounted, onUnmounted, type Ref, ref, toRef } from 'vue';

import { getChildrenTaskByTaskId } from '@/apps/work/api/graphql/sub-task-api';
import type { Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import SubTaskDialog from '@/apps/work/views/task/component/detail/sub-task/SubTaskDialog.vue';
import SubTaskItem from '@/apps/work/views/task/component/detail/sub-task/SubTaskItem.vue';
import ReportTask from '@/apps/work/views/task/component/form/ReportTask.vue';
import SaveTask from '@/apps/work/views/task/component/form/SaveTask.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  title: {
    type: String,
    default: 'Công việc con'
  },
  taskId: {
    type: String,
    default: undefined
  }
});
const subTasks = ref<Task[]>([]);
const subTaskId = ref();
const visibleDialog = ref<boolean>(false);
const {
  onResult: childrenOnResult,
  onError: childrenOnError,
  load: childrenLoad,
  refetch: childrenRefetch
} = getChildrenTaskByTaskId(props.taskId || '');
if (props.taskId) {
  childrenLoad(null, { taskId: props.taskId });

  childrenOnResult(res => {
    subTasks.value = res.data?.getChildrenTaskByTaskId || [];
  });
}

function refetchSubTasks() {
  childrenRefetch({ taskId: props.taskId || '' });
}

childrenOnResult(res => {
  subTasks.value = res.data?.getChildrenTaskByTaskId || [];
});

function addSubTask() {
  visibleDialog.value = true;
}

const visibleForm = ref<boolean>(false);

function addNewSubTask() {
  visibleForm.value = true;
}

function hideForm() {
  visibleForm.value = false;
  subTaskId.value = '';
}

//Report
const reportVisible = ref<boolean>(false);
const reportTaskVar = ref<Task>();

function reportTaskFun(task: Task) {
  subTaskId.value = task.id;
  reportTaskVar.value = task;
  // reportVisible.value = true;
  visibleForm.value = true;
}

const { canModifyTask } = useTaskStore();
const providedTask = inject<Ref<Task | undefined>>('providedTask', toRef(undefined));
const disableModify = computed(() => {
  return !!providedTask.value && canModifyTask(providedTask.value);
});

onMounted(() => {
  EventBus.on('refetchSubTasks', refetchSubTasks);
});
onUnmounted(() => {
  EventBus.off('refetchSubTasks', refetchSubTasks);
});
</script>

<style scoped>

</style>