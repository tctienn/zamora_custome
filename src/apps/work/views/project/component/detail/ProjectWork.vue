<template>
  <div class='surface-ground'>
    <div class='flex justify-content-between m-2'>
      <div
        class='align-content-center font-semibold'
        style='font-size: 20px'>Danh sách công việc
      </div>

      <div class='align-content-center pt-2'>
        <InputText
          v-model='keyword'
          :placeholder="t('common.search')"
          @keyup.enter='searchDatatable'/>
      </div>

      <div class='flex gap-1 pt-2'>
        <ButtonGroup>
          <Button
            v-if='!disableModify'
            class='h-full'
            :disabled='!!disableByStatus'
            icon='pi pi-calendar-plus'
            icon-size='1.5'
            label='Thêm giai đoạn'
            outlined
            @click='visibleFormPhase = true'>
          </Button>

          <Button
            v-if='!disableModify'
            class='h-full'
            :disabled='!!disableByStatus'
            icon='pi pi-plus'
            icon-size='1.5'
            label='Thêm công việc'
            outlined
            @click='addTask'>
          </Button>

          <Button
            class='h-full'
            icon='pi pi-list'
            icon-size='1.5'
            :label='"Hiển thị"'
            outlined
            @click='viewTypeRef?.toggle'>
          </Button>

          <Button
            class='h-full'
            :icon='"pi pi-filter"'
            icon-size='1.5'
            :label='"Lọc nhanh"'
            outlined
            @click='filterRef?.toggle'>
          </Button>

          <Button
            class='h-full'
            icon='pi pi-sort'
            icon-size='1.5'
            :label='t("common.sort")'
            outlined
            @click='sortRef?.toggle'>
          </Button>
        </ButtonGroup>
      </div>
    </div>

    <div
      class='overflow-auto'
      style='height: calc(100vh - 15rem)'>
      <component
        :is='viewComponent'
        :disable-by-status='disableByStatus'
        :expand-column='expandColumnPhase'
        :hide-project-name='true'
        :project-id='props.projectId'
        :tasks='filterTasks'
        @add-task-to-phase='addTaskToPhase'>
      </component>
    </div>

    <Menu
      ref='viewTypeRef'
      :model='viewTypeMenu'
      popup>

      <template #item='itemProp'>
        <div class='cursor-pointer flex gap-1 p-2'>
          <AppIcon
            class='mr-2'
            name='check'
            size='1.5'
            :style='{opacity:viewType==itemProp.item.key?1:0,
                     color: viewType == itemProp.item.key ? "#0d99ff" : ""}'/>

          <div
            :style='{color: viewType == itemProp.item.key ? "#0d99ff" : ""}'>
            {{ itemProp.item.label }}
          </div>
        </div>
      </template>
    </Menu>

    <Menu
      ref='filterRef'
      :model='searchFilters'
      popup>
      <template #item='itemProp'>
        <div
          class='cursor-pointer flex gap-1 p-2'>
          <AppIcon
            class='mr-2'
            name='check'
            size='1.5'
            :style='{opacity:filterStatusId==itemProp.item.key?1:0,
                     color: filterStatusId==itemProp.item.key ? "#0d99ff" : ""}'/>
          <div
            disabled
            :style='{color: filterStatusId==itemProp.item.key ? "#0d99ff" : ""}'>
            {{ itemProp.item.label }}
          </div>
        </div>
      </template>
    </Menu>

    <Menu
      ref='sortRef'
      :model='sortMenu'
      popup>
      <template #item='itemProp'>
        <div class='cursor-pointer flex gap-1 p-2'>
          <div
            class='justify-content-center pi text-xl'
            :class='sortMap?.[itemProp.item?.key||""]?.icon ??"pi-sort-amount-down"'
            :style='{opacity:sort.length>0 && sort[0].property==itemProp.item.key?1:0,
                     color: sort.length > 0 && sort[0].property == itemProp.item.key ? "#0d99ff" : ""}'>
          </div>

          <div
            :style='{color: sort.length > 0 && sort[0].property == itemProp.item.key ? "#0d99ff" : ""}'>
            {{ itemProp.item.label }}
          </div>
        </div>
      </template>
    </Menu>

    <TaskDetail
      v-model:active-index='activeIndex'
      v-model:visible='visibleTaskDetail'
      :task-id='taskId'/>

    <SaveTask
      v-if='visibleForm'
      v-model:visible='visibleForm'
      :phase-id='phaseId'
      :project-id='props.projectId'
      :task-id='taskId'
      @hide-dialog='hideForm'
      @reload='reloadTask'>
    </SaveTask>

    <TaskMenuAction
      ref='menuAction'
      @edit-task='editTask'>
    </TaskMenuAction>

    <FormProjectPhase
      v-model:visible='visibleFormPhase'
      :project-id='props.projectId'
      @hide-dialog='hideFormPhase'/>

  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import type Button from 'primevue/button';
import type Menu from 'primevue/menu';
import { type Component, computed, inject, onMounted, onUnmounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { allStatus } from '@/apps/work/api/graphql/config-work-status-api';
import { searchTasks } from '@/apps/work/api/graphql/task-api';
import type { Task } from '@/apps/work/model/task';
import { type SearchWorkInput } from '@/apps/work/model/work';
import { useParameterConfigStore } from '@/apps/work/store/parameter-config';
import { useTaskStore } from '@/apps/work/store/task';
import FormProjectPhase from '@/apps/work/views/project/component/FormProjectPhase.vue';
import type { ProjectInterface } from '@/apps/work/views/project/model';
import TaskCalendarManager from '@/apps/work/views/task/component/calendar/TaskCalendarManager.vue';
import SaveTask from '@/apps/work/views/task/component/form/SaveTask.vue';
import TaskGanttManager from '@/apps/work/views/task/component/gantt/TaskGanttManager.vue';
import GroupImplement from '@/apps/work/views/task/component/groupImplement/GroupImplement.vue';
import GroupPhase from '@/apps/work/views/task/component/groupPhase/GroupPhase.vue';
import TaskHierarchyManager from '@/apps/work/views/task/component/hierarchy/TaskHierarchyManager.vue';
import TaskKanbanManager from '@/apps/work/views/task/component/kanban/TaskKanbanManager.vue';
import TaskTableManager from '@/apps/work/views/task/component/table/TaskTableManager.vue';
import TaskDetail from '@/apps/work/views/task/component/TaskDetail.vue';
import TaskMenuAction from '@/apps/work/views/task/component/TaskMenuAction.vue';
import { DEFAULT_PAGE } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { associate } from '@/common/helpers/extension/array.extension';
import type { Edge } from '@/common/model/page';
import { Direction, type Order } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined
  },
  project: {
    type: {} as PropType<ProjectInterface>,
    default: {} as ProjectInterface
  }
});

const emits = defineEmits(['totalTask']);
const disableByStatus = computed(() => ['PAUSE', 'CANCEL', 'CLOSE'].includes(props.project.status));
const {
  filterTasks,
  tasks,
  sort,
  filterStatusId,
  statuses,
  searchKeyword
} = storeToRefs(useTaskStore());

let searchFilters = ref<{ label: string, key: string, command: () => void }[]>();

allStatus().onResult((res) => {
  statuses.value = res.data.allStatus;
});
const { parameterProject } = storeToRefs(useParameterConfigStore());
const activeIndex = ref<number>(0);
const visibleForm = ref<boolean>(false);
const visibleFormPhase = ref<boolean>(false);
const { user } = storeToRefs(useUserStore());
const taskId = ref();
const keyword = ref<string>('');
const { t } = useI18n();
const visibleTaskDetail = ref<boolean>(false);
const works = ref<any[]>([]);
const totalCount = ref<number>(0);
const expandColumnPhase = ref();
const viewTypeRef = ref<InstanceType<typeof Menu> | null>(null);
const filterRef = ref<InstanceType<typeof Menu> | null>(null);
type ViewType = 'list' | 'kanban' | 'hierarchy' | 'calendar' | 'gantt' | 'groupPhase' | 'groupImplement';
const viewType = ref<ViewType>('list');
const disableModify = inject('disableModifyInProject', ref<boolean>());
const viewComponent = computed(() => {
  switch (viewType.value) {
  case 'list':
    return TaskTableManager;
  case 'kanban':
    return TaskKanbanManager;
  case 'gantt':
    return TaskGanttManager;
  case 'hierarchy':
    return TaskHierarchyManager;
  case 'calendar':
    return TaskCalendarManager;
  case 'groupPhase':
    return GroupPhase;
  case 'groupImplement':
    return GroupImplement;
  }
  return TaskTableManager;
});

const sortRef = ref<InstanceType<typeof Menu> | null>(null);
const sortMenu = ref([
  {
    label: t('work.task.sortOptions.orderNo'),
    key: 'orderNo',
    command: () => toggleSort('orderNo'),
  },
  {
    label: t('work.task.sortOptions.lastModifiedTime'),
    key: 'lastModifiedTime',
    command: () => toggleSort('lastModifiedTime'),
  },
  {
    label: t('work.task.sortOptions.name'),
    key: 'name',
    command: () => toggleSort('name'),
  },
  {
    label: t('work.task.sortOptions.percent'),
    key: 'percent',
    command: () => toggleSort('percent'),
  }, {
    label: t('work.task.sortOptions.remainTime'),
    key: 'remainTime',
    command: () => toggleSort('remainTime'),
  },
]);

const searchInput = ref<SearchWorkInput>({
  userId: user.value.id!,
  projectId: props.projectId
});
const page = reactive({
  ...DEFAULT_PAGE,
  sort: [],
  size: 999999
});
const {
  load: worksLoad,
  onResult: worksOnResult,
  onError: worksOnError,
  refetch: worksRefetch,
} = searchTasks(searchInput.value, page);

const sortMap = computed<Record<string, Order & { icon: string }>>({
  get() {
    return associate(sort.value, item => [item.property, {
      property: item.property,
      direction: item.direction,
      icon: item.direction == Direction.ASC ? 'pi-sort-amount-up' : 'pi-sort-amount-down'
    }]);
  },
  set(value) {
    const rs: Order[] = [];
    Object.values(value).forEach((value) => {
      rs.push({
        property: value.property,
        direction: value.direction
      });
    }
    );
    sort.value = rs;
  }
});

function toggleSort(field: string) {
  const currentSort = sortMap.value[field];
  if (!currentSort) {
    sortMap.value = {
      [field]: {
        property: field,
        direction: Direction.ASC,
        icon: 'pi-sort-amount-up'
      },
    };
  } else if (currentSort.direction === Direction.ASC) {
    sortMap.value = {
      [field]: {
        property: field,
        direction: Direction.DESC,
        icon: 'pi-sort-amount-down'
      },
    };
  } else {
    const {
      [field]: _,
      ...rest
    } = sortMap.value;
    sortMap.value = rest;
  }
}

worksOnResult(res => {
  works.value = res.data?.searchTasks?.edges?.map((e: Edge<Task>) => e.node).map((data: any) => ({
    ...data,
    remainTime: data.dueTime ? Date.now() - new Date(data.dueTime).valueOf() : -Infinity
  })) || [];
  totalCount.value = res.data?.searchTasks?.totalCount || 0;
  tasks.value = parameterProject.value?.restrictChildTaskView == true || parameterProject.value?.restrictFollowerView == true ? works.value.filter((work) =>
    work.assignerId == user.value.id || work.implementers.some((implementer: any) => implementer.participantId == user.value.id)
          || work.followers.some((follower: any) => follower.participantId == user.value.id))
    : works.value;

  emits('totalTask', tasks.value.length);

  // tasks.value = parameterProject.value?.restrictFollowerView == true ? works.value.filter((work) =>
  //   work.assignerId == user.value.id || work.followers.some((follower: any) => follower.participantId == user.value.id)) : tasks.value;
  expandColumnPhase.value = Array.from(new Set(tasks.value.map(task => task.phaseId)));
});
worksOnError(error => {
  toastError({ message: error.message });
});

worksLoad();

const menuAction = ref<InstanceType<typeof TaskMenuAction> | null>(null);

function toggleTaskMenu(payload: { event: Event, task: Task }) {
  menuAction.value?.toggleActionMenu(payload.event, payload.task);
}

function updateFilterCondition(newFilter: string) {
  filterStatusId.value = filterStatusId.value === newFilter ? '' : newFilter;
}

function addTask() {
  taskId.value = undefined;
  visibleForm.value = true;
  phaseId.value = undefined;
}

function hideForm() {
  taskId.value = undefined;
  phaseId.value = undefined;
}

function hideFormPhase() {
  worksLoad() || worksRefetch();
}

const viewTypeMenu = ref([
  {
    label: 'Danh sách',
    key: 'list',
    command: () => {
      viewType.value = 'list';
    },
  },
  {
    label: 'Kanban',
    key: 'kanban',
    command: () => {
      viewType.value = 'kanban';
      filterStatusId.value = 'ALL';
    },
  },
  {
    label: 'Gantt',
    key: 'gantt',
    command: () => {
      viewType.value = 'gantt';
      filterStatusId.value = 'ALL';
    },
  },
  {
    label: 'Giai đoạn',
    key: 'groupPhase',
    command: () => {
      viewType.value = 'groupPhase';
      filterStatusId.value = 'ALL';
    },
  },
  {
    label: 'Người thực hiện',
    key: 'groupImplement',
    command: () => {
      viewType.value = 'groupImplement';
      filterStatusId.value = 'ALL';
    },
  }
]);

function editTask(id: string) {
  taskId.value = id;
  visibleForm.value = true;
}

function searchDatatable() {
  searchKeyword.value = keyword.value;
}

watch(visibleForm, (value) => {
  if (!value) {
    worksLoad(undefined, {
      searchTaskInput: searchInput.value,
      page: page
    }) || worksRefetch();
  }
});

watch(statuses, (value) => {
  searchFilters.value = [...[{
    label: 'Tất cả',
    key: 'ALL',
    command: () => updateFilterCondition('ALL'),
  }], ...value.map((status) => ({
    label: status.name,
    key: status.id,
    command: () => updateFilterCondition(status.id),
  }))];
});

function showTaskDetail(payload: { id: string, tabIndex?: number }) {
  visibleTaskDetail.value = true;
  taskId.value = payload.id;
  activeIndex.value = payload.tabIndex || 0;
}

const phaseId = ref<string | undefined>();

function addTaskToPhase(id: string | undefined) {
  phaseId.value = id;
  taskId.value = undefined;
  visibleForm.value = true;
}

function reloadTask() {
  const variables = {
    searchTaskInput: searchInput.value,
    page: page
  };
  worksLoad(null, variables) || worksRefetch(variables);
  EventBus.emit('refreshProjects');
}

onMounted(() => {
  EventBus.on('toggleTaskMenu', toggleTaskMenu);
  EventBus.on('showTaskDetail', showTaskDetail);
});

onUnmounted(() => {
  EventBus.off('toggleTaskMenu', toggleTaskMenu);
  EventBus.on('showTaskDetail', showTaskDetail);
});
</script>

<style scoped>

:deep(.group-avatar-container) {
  justify-content: center;
}

:deep(.avatar-container) {
  justify-content: center;
}
</style>