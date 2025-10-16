<template>
  <slot
    name='header'
    :reload='reload'>
    <TaskManagerHeader
      v-model:button-model='selectedButtonModel'
      v-model:search-date='searchDate'
      v-model:task-id='taskId'
      v-model:view-type='viewType'
      v-model:visible-form='visibleForm'
      :loading='listDataLoading'
      :map-count-lv1='mapCountCodeLv1'
      :search-input='searchInput'
      @filter-deadline-extension='filterDeadlineExtension'
      @filter-evaluate='filterEvaluate'
      @reload='reload'/>
  </slot>
  <slot name='body'>
    <component
      :is='viewComponent'
      :is-admin-search='isAdminSearch'
      :is-loading='listDataLoading'
      :tasks='filterTasks'>
    </component>
  </slot>

  <TaskDetail
    v-model:active-index='activeIndex'
    v-model:visible='visibleTaskDetail'
    :task-id='taskId'/>

  <SaveTask
    v-model:visible='visibleForm'
    :task-id='taskId'
    @hide-dialog='hideForm'
    @reload='reload'>
  </SaveTask>

  <TaskMenuAction
    ref='menuAction'
    @edit-task='editTask'>
  </TaskMenuAction>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { type Component, computed, inject, onMounted, onUnmounted, reactive, ref, toRef, watch, } from 'vue';
import { useI18n } from 'vue-i18n';

import { countTasksRole, searchTasks } from '@/apps/work/api/graphql/task-api';
import { type SearchTaskInput, type Task, TaskRoleFilter, } from '@/apps/work/model/task';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import { useTaskStore } from '@/apps/work/store/task';
import TaskCalendarManager from '@/apps/work/views/task/component/calendar/TaskCalendarManager.vue';
import SaveTask from '@/apps/work/views/task/component/form/SaveTask.vue';
import TaskGanttManager from '@/apps/work/views/task/component/gantt/TaskGanttManager.vue';
import TaskGroupByGroupTaskManager
  from '@/apps/work/views/task/component/groupByGroupTask/TaskGroupByGroupTaskManager.vue';
import TaskGroupByProjectManager from '@/apps/work/views/task/component/groupByProject/TaskGroupByProjectManager.vue';
import TaskHierarchyManager from '@/apps/work/views/task/component/hierarchy/TaskHierarchyManager.vue';
import TaskKanbanManager from '@/apps/work/views/task/component/kanban/TaskKanbanManager.vue';
import TaskTableManager from '@/apps/work/views/task/component/table/TaskTableManager.vue';
import TaskDetail from '@/apps/work/views/task/component/TaskDetail.vue';
import TaskMenuAction from '@/apps/work/views/task/component/TaskMenuAction.vue';
import TaskManagerHeader from '@/apps/work/views/task/manager/TaskManagerHeader.vue';
import type { ButtonModelType, ViewType, } from '@/apps/work/views/task/manager/type';
import { DateTimeFormat } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  isAdminSearch: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const { user } = storeToRefs(useUserStore());
const {
  filterTasks,
  tasks
} = storeToRefs(useTaskStore());

const visibleForm = ref<boolean>(false);
const taskId = ref<string>();

function hideForm() {
  taskId.value = undefined;
}

const searchInput = ref<SearchTaskInput>({
  userId: user.value.id || '',
  isAdminSearch: props.isAdminSearch,
  isFilterEvaluate: false,
  isFilterDeadlineExtension: false,
} as SearchTaskInput);
// watch(() => usersMoreInfo.value[user.value.id || '']?.roles, value => {
//   if (value) {
//     searchInput.value.isAdminSearch = value.includes(ADMIN);
//   }
// }, { immediate: true });
//Search date
const { moment } = useMoment();
// const searchDate = ref<Date>(new Date());
const searchDate = defineModel<Date | null>('searchDate', { default: new Date() });
watch(searchDate, value => {
  if (value) {
    // First second of the month
    const firstSecond = new Date(value.getFullYear(), value.getMonth(), 1, 0, 0, 0);
    // Last second of the month
    const lastSecond = new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59);
    searchInput.value.fromDateTime = moment(firstSecond).format(DateTimeFormat.ISO_LOCAL_DATE_TIME);
    searchInput.value.toDateTime = moment(lastSecond).format(DateTimeFormat.ISO_LOCAL_DATE_TIME);
  } else {
    searchInput.value.fromDateTime = undefined;
    searchInput.value.toDateTime = undefined;
  }
}, { immediate: true });
//Tab lv1
const mapCountCodeLv1 = reactive<Record<TaskRoleFilter | 'waitingEvaluate' | 'deadlineExtension', number>>({
  ALL: 0,
  ASSIGN: 0,
  FOLLOW: 0,
  IMPLEMENT: 0,
  MY_DEPT: 0,
  waitingEvaluate: 0,
  deadlineExtension: 0,
});
const countWorksQuery = countTasksRole({ ...searchInput.value });
const {
  result: countRs,
  onResult: countOnResult,
  refetch: countRefetch
} = countWorksQuery;
countOnResult(param => {
  const data = param.data?.countTasksRole;
  mapCountCodeLv1.ALL = data?.all;
  mapCountCodeLv1.IMPLEMENT = data?.implement;
  mapCountCodeLv1.ASSIGN = data?.assign;
  mapCountCodeLv1.FOLLOW = data?.follow;
  mapCountCodeLv1.MY_DEPT = data?.myDept;
  mapCountCodeLv1.waitingEvaluate = data?.waitingEvaluate;
  mapCountCodeLv1.deadlineExtension = data?.deadlineExtension;
});
watch(searchDate, (value) => {
  countRefetch({ searchTaskInput: searchInput.value });
});

function changeTabCommand(filter: TaskRoleFilter[] | undefined) {
  searchInput.value.taskRole = filter;
  countRefetch({ searchTaskInput: searchInput.value });
}

const selectedButtonModel = ref<ButtonModelType>();
watch(selectedButtonModel, value => {
  if (value) {
    changeTabCommand(value.code == TaskRoleFilter.ALL ? undefined : [value.code]);
  }
});

function addTask() {
  taskId.value = undefined;
  visibleForm.value = true;
}

//View type
const viewType = defineModel<ViewType>('viewType', { default: 'list' });
const viewComponent = computed(() => {
  switch (viewType.value) {
  case 'list':
    return TaskTableManager;
  case 'kanban':
    return TaskKanbanManager;
  case 'hierarchy':
    return TaskHierarchyManager;
  case 'calendar':
    return TaskCalendarManager;
  case 'gantt':
    return TaskGanttManager;
  case 'groupByProject':
    return TaskGroupByProjectManager;
  case 'groupByGroupTask':
    return TaskGroupByGroupTaskManager;
  }
  return TaskTableManager;
});

const pageable: Pageable = {
  page: 0,
  size: 9999999,
  sort: [
    {
      property: 'last_modified_time',
      direction: Direction.DESC,
    },
    {
      property: 'order_no',
      direction: Direction.ASC,
    },

  ],
};

const {
  load: listDataLoad,
  refetch: listDataRefetch,
  onResult: listDataOnResult,
  result: listDataResult,
  loading: listDataLoading,
} = searchTasks(searchInput.value, pageable);
listDataOnResult(res => {
  tasks.value = res.data?.searchTasks?.edges?.map((e: Edge<Task>) => {
    return {
      ...e.node,
      remainTime: e.node?.dueTime ? Date.now() - new Date(e.node?.dueTime).valueOf() : -Infinity
    };
  }) || [];

});
listDataLoad();

//Menu action
const menuAction = ref<InstanceType<typeof TaskMenuAction> | null>(null);

function toggleTaskMenu(payload: { event: Event, task: Task }) {
  menuAction.value?.toggleActionMenu(payload.event, payload.task);
}

function reload() {
  listDataRefetch({
    searchTaskInput: searchInput.value,
    page: pageable
  });
}

function editTask(id: string) {
  taskId.value = id;
  visibleForm.value = true;
}

//Task detail
const visibleTaskDetail = ref<boolean>(false);
const activeIndex = ref<number>(0);

function showTaskDetail(payload: { id: string; tabIndex?: number }) {
  visibleTaskDetail.value = true;
  taskId.value = payload.id;
  activeIndex.value = payload.tabIndex || 0;
}

//Search
const searchTerm = inject('searchTerm', toRef(''));
watch(searchTerm, (value) => {
  if (value.trim() === '') {
    searchInput.value.keyword = undefined;
  } else {
    searchInput.value.keyword = value.trim();
  }
});

//Filter deadline extension and evaluate
function filterEvaluate(state: boolean) {
  searchInput.value.isFilterEvaluate = state;
}

function filterDeadlineExtension(state: boolean) {
  searchInput.value.isFilterDeadlineExtension = state;
}

onMounted(() => {
  EventBus.on('toggleTaskMenu', toggleTaskMenu);
  EventBus.on('refetchMyWork', reload);
  EventBus.on('showTaskDetail', showTaskDetail);
});

onUnmounted(() => {
  EventBus.off('toggleTaskMenu', toggleTaskMenu);
  EventBus.off('refetchMyWork', reload);
  EventBus.off('showTaskDetail', showTaskDetail);
});
useParameterConfigStore();

//Set inplace input in callBack, do not change reference
function updateSearchInput(callBack: (oldValue: SearchTaskInput) => void) {
  callBack(searchInput.value);
}

defineExpose({ updateSearchInput });
</script>

<script lang='ts'>
export default { name: 'WorkManager' };
</script>
