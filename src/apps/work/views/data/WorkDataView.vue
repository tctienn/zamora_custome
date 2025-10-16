<template>
  <div class='flex flex-column h-full row-gap-3'>
    <WorkDataViewHeader
      ref='workDataViewHeaderRef'
      :search-from-date='searchFromDate'
      :search-to-date='searchToDate'
      :type='viewerType'
      @open-quick-save-task-dialog='quickSaveWorkDialogVisible = true'
      @open-save-task-dialog='saveWorkDialogVisible = true'
      @update-range='updateRange'
      @update-viewer-type='updateViewerType'/>
    <div class='flex flex-column h-full overflow-hidden'>
      <component
        :is='viewerType'
        :columns='columns'
        :selected-columns='selectedColumns'
        :selected-columns-filter='selectedColumnsFilter'
        :show-type='showType'
        :tasks='filterTasks'
        @open-quick-save-task-dialog='quickSaveWorkDialogVisible = true'
        @update-columns='updateColumns'/>
    </div>
  </div>

  <SaveWork
    v-if='saveWorkDialogVisible'
    :dialog-visible='saveWorkDialogVisible'
    @hide-dialog='saveWorkDialogVisible = false'
    @reload='reload'/>

  <QuickSaveWork
    v-if='quickSaveWorkDialogVisible'
    :dialog-visible='quickSaveWorkDialogVisible'
    @hide-dialog='quickSaveWorkDialogVisible = false'
    @reload='reload'/>
  <TaskActionMenu ref='menu'/>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { findTaskByUserRangeDateGraphql } from '@/apps/work/api/graphql/task-api';
import type { Task } from '@/apps/work/model/task';
import { ShowTypes } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import TaskActionMenu from '@/apps/work/views/actions/contextMenu/TaskActionMenu.vue';
import QuickSaveWork from '@/apps/work/views/actions/QuickSaveWork.vue';
import SaveWork from '@/apps/work/views/actions/SaveWork.vue';
import WorkDataViewHeader from '@/apps/work/views/data/components/WorkDataViewHeader.vue';
import { toastError } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';

const route = useRoute();
const { t } = useI18n();
const menu = ref();

const taskStore = useTaskStore();
const {
  tasks,
  filterTasks,
  statuses
} = storeToRefs(taskStore);
const saveWorkDialogVisible = ref(false);
const quickSaveWorkDialogVisible = ref(false);
const { moment } = useMoment();
const workDataViewHeaderRef = ref();
const now = new Date();
const searchFromDate = ref(moment(now).add(-1, 'month').toDate());
const searchToDate = ref(moment(now).add(1, 'month').toDate());

const columns = ref();
const listColUnUse: string[] = ['id', 'name', 'code', 'assessorId', 'parentId', 'createdTime', 'createdBy', 'hasAttachment',
  'participants', 'checkListCount', 'commentCount', 'hasLocation', 'statusId', 'statusName', 'assignerId', 'assessorName',
  'lastModifiedTime', 'completionTime', 'startTime', 'dueTime', 'percent', 'assignerName'];
const hardColumns: string[] = ['type', 'progress'];
const selectedColumns = ref<{ code: string, name: string }[]>([
  {
    code: 'type',
    name: t('work.type')
  },
  {
    code: 'progress',
    name: t('work.progress'),
  },
]);
const selectedColumnsFilter = computed(() => selectedColumns.value.filter(i => !hardColumns.includes(i.code)));

const searchRangeDate = computed(() => ({
  fromDate: moment(searchFromDate.value).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
  toDate: moment(searchToDate.value).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
}));
const showType = ref(ShowTypes[ShowTypes.DATA_LIST]);

const {
  refetch: findTaskByUserRangeDateRefetch,
  onResult: findTaskByUserRangeDateOnResult,
  onError: findTaskByUserRangeDateOnError
} = findTaskByUserRangeDateGraphql(searchRangeDate.value);
findTaskByUserRangeDateOnResult(res => {
  tasks.value = res.data.findTaskByUserRangeDate;

  if (tasks.value[0]) {
    const filteredColumns = Object.keys(tasks.value[0])
      .filter(key => !listColUnUse.includes(key)).map(item => ({
        code: item,
        name: t(`work.${item}`),
      }));
    columns.value = filteredColumns.concat(
      hardColumns.map(item => ({
        code: item,
        name: t(`work.${item}`),
      }))
    );
  }
});
findTaskByUserRangeDateOnError(error => {
  toastError();
});

type WorkDataViewerType = 'WorkDataListView' | 'WorkDataKanbanView' | 'WorkDataCalendarView' | 'WorkDataFileView'

const viewerType = ref<WorkDataViewerType>('WorkDataListView');

function updateViewerType(type: WorkDataViewerType) {
  if (type === 'WorkDataKanbanView') {
    taskStore.resetFilterStatus();
  }
  viewerType.value = type;
}

onBeforeMount(() => {
  viewerType.value = `${route.name?.toString()}View` as WorkDataViewerType;
});

function toggleTaskMenu(payload: { event: Event, task: Task }) {
  menu.value.toggleMenu(payload.event, payload.task);
}

onMounted(() => {
  EventBus.on('toggleTaskMenu', toggleTaskMenu);
  EventBus.on('refetchMyWork', reload);
});

onUnmounted(() => {
  EventBus.off('toggleTaskMenu', toggleTaskMenu);
  EventBus.off('refetchMyWork', reload);
});

function updateRange({
  fromDate,
  toDate
}: {
  fromDate: Date,
  toDate: Date
}) {
  searchFromDate.value = fromDate;
  searchToDate.value = toDate;
}

function reload() {
  // findAllStatusRefetch(searchRangeDate.value);
  findTaskByUserRangeDateRefetch(searchRangeDate.value);
}

function updateColumns(val: { code: string, name: string }[]) {
  selectedColumns.value = val;
}

watch(() => searchRangeDate.value, () => {
  reload();
});

</script>

<script lang='ts'>
import WorkDataCalendarView from '@/apps/work/views/data/WorkDataCalendarView.vue';
import WorkDataFileView from '@/apps/work/views/data/WorkDataFileView.vue';
import WorkDataKanbanView from '@/apps/work/views/data/WorkDataKanbanView.vue';
import WorkDataListView from '@/apps/work/views/data/WorkDataListView.vue';

export default {
  name: 'WorkDataView',

  components: {
    WorkDataCalendarView,
    WorkDataFileView,
    WorkDataKanbanView,
    WorkDataListView
  }
};
</script>