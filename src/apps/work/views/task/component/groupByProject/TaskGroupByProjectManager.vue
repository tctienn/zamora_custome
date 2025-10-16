<template>
  <DataTable
    v-model:expandedRowGroups='expandedRowGroups'
    v-model:selection='selection'
    expandable-row-groups
    group-rows-by='project.id'
    :loading='isLoading'
    :pt="{
      rowGroupHeader:{
        style:{
          top:'44px'
        }
      }
    }"
    :row-class='(data)=>overdueClass(data,mapStatuses)'
    row-group-mode='subheader'
    :row-hover='false'
    scroll-height='calc(100vh - 13rem)'
    scrollable
    selection-mode='single'
    sort-field='project.name'
    sort-mode='single'
    :sort-order='1'
    :value='indexedTasks'
    @row-dblclick='rowClick'>
    <Column
      field='project.id'
      header='Project'>
    </Column>
    <Column
      body-class='text-center'
      header='#'>
      <template #body='{data}'>
        {{ data?.groupIndex }}
      </template>
    </Column>
    <Column
      :header='t("work.task.taskName")'>
      <template #body='{data}'>
        <div>
          <span
            class='font-semibold hover:text-blue-400'
            @click.stop='workNameClick(data)'>
            <i
              v-if='data?.priority==TaskPriority.HIGH'
              class='pi pi-star-fill'
              style='color:#eedb08'></i>
            {{ data?.name }}
          </span>
          <div class='flex justify-content-between'>
            <div
              v-if='data?.startTime || data?.dueTime'
              v-tooltip.top='t("work.task.taskDuration")'
              class='task-duration'>
              {{ formatDate(data?.startTime, 'DD/MM/yyyy') }} -
              {{ formatDate(data?.dueTime, 'DD/MM/yyyy') }}
            </div>
          </div>
        </div>
      </template>
    </Column>
    <Column
      class='text-center'
      :header='t("work.task.assign")'>
      <template #body='{data}'>
        <div class='flex justify-content-center'>
          <AppUser
            v-if='data?.assignerId'
            avatar-size='2.5'
            is-highlight
            overlay-visible
            :user-id='data?.assignerId'>
          </AppUser>
        </div>
      </template>
    </Column>
    <Column
      :header='t("work.task.implement")'>
      <template #body='{data}'>
        <div class='flex justify-content-center'>
          <AppGroupAvatar
            avatar-size='2.5'
            :user-ids='filterThenMap((data?.participants ||[]) as Participant[],
                                     item => item?.type === "IMPLEMENTER",
                                     item => item.participantId)'
            :users-highlight='[data?.assignerId]'>
          </AppGroupAvatar>
        </div>
      </template>
    </Column>
    <Column
      class='p-0'
      :header='t("work.task.percent")'>
      <template #body='{data}'>
        <!--        <div class='text-center text-sm'> {{ data?.percent ?? 0 }}%</div>-->
        <div class='align-content-center'>
          <ProgressRing
            :progress='data?.percent||0'></ProgressRing>
        </div>
        <!--        <ProgressBar-->
        <!--          :show-value='false'-->
        <!--          style='height: 0.5rem'-->
        <!--          :value='data?.percent'></ProgressBar>-->
      </template>

    </Column>
    <Column
      body-class='text-center'
      :header='t("work.task.duration")'>
      <template #body='{data}'>
        <template
          v-for='(diff,idx) in [getDateDifference(new Date(), data?.dueTime,"days")]'
          :key='idx'>
          <span
            v-if='diff'
            class='status-badge'
            :class='{"overdue":diff<0,"on-going":diff>=0}'>
            {{ `${diff >= 0 ? `Còn ${diff}` : `Quá ${-diff}`} ngày` }}
          </span>
        </template>
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='"Ngày cập nhật"'>
      <template #body='{data}'>
        {{ formatDate(data?.lastModifiedTime) }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='"Trạng thái"'>
      <template #body='{data}'>
        <span
          class='status-badge'
          :style="{'background-color':`#${mapStatuses[data.statusId]?.color||'ffffff'}`,
                   'color':calculateColorBasedOnBackgroundColor('#'+mapStatuses[data.statusId]?.color||'#ffffff')}">
          {{ data?.statusName }}
        </span>
      </template>
    </Column>
    <Column
      v-if='!isAdminSearch'
      body-class='text-center'
      :header='t("common.action")'>
      <template #body='{data}'>
        <Button
          v-tooltip.top='t("common.action")'
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='toggleMenu($event,data)'></Button>
      </template>
    </Column>
    <template #groupheader='{data}'>
      <span
        v-tooltip.top='t("work.project.name")'
        class='cursor-pointer font-bold hover:text-blue-400 mx-2'
        style='color: #0F6CBD'
        @click.stop='showDialogDetailProject(data?.project?.id)'>
        {{ data?.project?.name ?? 'Không xác định' }}
      </span>
      <span
        v-if='data?.project?.name'
        class='font-normal ml-1 text-gray-500'> {{
          data?.project?.id != 'undefined' ?
            '(' + moment(data?.project?.fromDate).format('DD/MM/YYYY') + ' - ' + moment(data?.project?.toDate).format('DD/MM/YYYY') + ')' : ''
        }}</span>
    </template>
  </DataTable>

  <TaskDetail
    v-model:visible='visibleTaskDetail'
    :task-id='selectedTask?.id'/>
  <ProjectDetail
    v-model:visible='visibleProjectDetail'
    :project-id='selectedProjectId'
    @hide='hideProjectDetail'/>
</template>

<script lang='ts' setup>
import moment from 'moment/moment';
import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Participant, Task } from '@/apps/work/model/task';
import { TaskPriority } from '@/apps/work/model/work';
import { useTaskStore } from '@/apps/work/store/task';
import ProjectDetail from '@/apps/work/views/project/component/detail/ProjectDetail.vue';
import { overdueClass } from '@/apps/work/views/task/component/task-utils';
import TaskDetail from '@/apps/work/views/task/component/TaskDetail.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import EventBus from '@/common/helpers/event-bus';
import { filterThenMap } from '@/common/helpers/extension/array.extension';
import { getDateDifference } from '@/common/helpers/time-util';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps({
  //Prevent warning
  projectId: {
    type: String,
    default: null
  },
  tasks: {
    type: Array as PropType<Task[]>,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isAdminSearch: {
    type: Boolean,
    default: false
  }
});
defineEmits<{
  (e: 'addTaskToPhase', phaseId: string | undefined): void
}>();
const {
  mapStatuses,
  statuses
} = storeToRefs(useTaskStore());

const { t } = useI18n();

const selectedTask = ref<Task>();
const expandedRowGroups = ref<(string | null)[]>([]);

function rowClick() {

}

function toggleMenu(event: Event, task: Task) {
  selectedTask.value = task;
  EventBus.emit('toggleTaskMenu', {
    event: event,
    task: task
  });
}

const visibleTaskDetail = ref<boolean>(false);

function workNameClick(data: Task) {
  selectedTask.value = props.tasks.find(e => e.id === data.id);
  visibleTaskDetail.value = true;
}

const visibleProjectDetail = ref<boolean>(false);
const selectedProjectId = ref<string>();

function hideProjectDetail() {
  EventBus.emit('refetchMyWork');
}

function showDialogDetailProject(projectId: string | undefined) {
  if (projectId) {
    selectedProjectId.value = projectId;
    visibleProjectDetail.value = true;
  }
}

const indexedTasks = computed(() => {

  const groupCounters: Record<string, number> = {};

  return props.tasks.map(task => {
    const projectId = task.project?.id || 'undefined';

    if (!groupCounters[projectId]) {
      groupCounters[projectId] = 1;
    }

    return {
      ...task,
      groupIndex: groupCounters[projectId]++
    };
  });
});
const selection = ref();
onMounted(() => {
  const projectIds = new Set<string | null>();
  indexedTasks.value.forEach(e => e.project?.id && projectIds.add(e.project.id));
  //Null vì có công việc không nằm trong dự án nào
  expandedRowGroups.value = [...projectIds, null];
});
</script>

<style lang='scss' scoped>

.overdue {
  background: var(--red-300);
  color: rgba(255, 255, 255, .87);
}

.on-going {
  background: var(--green-300);
  color: rgba(255, 255, 255, .87);
}

:deep(.p-knob-text) {
  font-size: xx-large !important;
}

.text-dark {
  color: #495057
}

.text-light {
  color: rgba(255, 255, 255, .87)
}

:deep(.overdue-row) {
  background: #FEFBEF !important;

  .task-duration {
    color: #FF0606 !important;
  }

  &:hover {
    background: #E6E2D8 !important
  }
}

:deep(.overdue-row.p-highlight) {
  background: #E6E2D8 !important
}
</style>