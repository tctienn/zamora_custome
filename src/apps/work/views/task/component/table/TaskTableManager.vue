<template>
  <div class='flex flex-column gap-2'>
    <TabMenu
      :model='tabMenuStatus'>
      <template #item='{item}'>
        <MenuItem
          :label='`${item.label} (${mapStatusesCount?.[item.id]||0})`'>
        </MenuItem>
      </template>
    </TabMenu>
  </div>
  <div
    class='overflow-auto surface-0'
    style='height: calc(100% - 3.7rem)'>
    <DataTable
      v-model:selection='selectedTask'
      :highlight-on-select='true'
      :loading='isLoading'
      :pt='{
        column: {
          class: "p-1",
        }
      }'
      :row-class='(data)=>overdueClass(data,mapStatuses)'
      :row-hover='true'
      scroll-height='flex'
      scrollable
      selection-mode='single'
      :value='tasks'
      @row-dblclick='rowClick'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {itemType: t('work.task.task').toLowerCase()})
        }}</span>
      </template>
      <Column
        body-class='text-center p-1'
        :header='t("common.ordinalNumber")'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        class='p-1 w-5'
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
                {{ formatDate(data?.startTime, 'DD/MM/yyyy') }} - {{
                  formatDate(data?.dueTime, 'DD/MM/yyyy')
                }}
              </div>
              <div
                v-if='!hideProjectName'
                v-tooltip.top='t("work.project.name")'
                class='cursor-pointer hover:text-blue-400'
                @click.stop='showDialogDetailProject(data?.project?.id)'>
                {{ data?.project?.name }}
              </div>
            </div>
          </div>
        </template>
      </Column>
      <Column
        class='p-1 text-center'
        :header='t("work.task.assigner")'>
        <template #body='{data}'>
          <AppUser
            v-if='data?.assignerId'
            avatar-size='2.5'
            is-highlight
            overlay-visible
            :user-id='data?.assignerId'>
          </AppUser>
        </template>
      </Column>
      <Column
        class='p-1'
        :header='t("work.task.implementer")'>
        <template #body='{data}'>
          <AppGroupAvatar
            avatar-size='2.5'
            :user-ids='filterThenMap((data?.participants ||[]) as Participant[],
                                     item => item?.type === "IMPLEMENTER",
                                     item => item.participantId)'
            :users-highlight='[data?.assignerId]'>
          </AppGroupAvatar>
        </template>
      </Column>
      <Column
        class='p-1'
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
        class='p-1'
        :header='t("work.task.duration")'>
        <template #body='{data}'>
          <RemainingTime
            v-if='mapStatuses[data?.statusId]?.type==StatusType.COMPLETED'
            :end='data?.dueTime'
            :is-complete='true'
            :on-going-text='(number)=>`Trước hạn ${number} ngày`'
            :start='data?.completionTime'>
          </RemainingTime>
          <RemainingTime
            v-else
            :end='data?.dueTime'
            :start='new Date()'>
          </RemainingTime>
        </template>
      </Column>
      <Column
        body-class='text-center'
        class='p-1'
        :header='"Ngày cập nhật"'>
        <template #body='{data}'>
          {{ formatDate(data?.lastModifiedTime) }}
        </template>
      </Column>
      <Column
        body-class='text-center'
        class='p-1'
        :header='"Trạng thái"'>
        <template #body='{data}'>
          <span
            class='border-round-sm status-badge text-sm'
            :class="classTextColorBaseBackground('#'+mapStatuses[data.statusId]?.color||'#ffffff')"
            :style="{'background-color':`#${mapStatuses[data.statusId]?.color||'ffffff'}`}">
            {{ data?.statusName }}
          </span>
        </template>
      </Column>
      <Column
        v-if='!isAdminSearch && !disableByStatus && !disableModify'
        body-class='text-center'
        class='p-1'
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
    </DataTable>
  </div>
  <ProjectDetail
    v-model:visible='visibleProjectDetail'
    :project-id='selectedProjectId'
    @hide='hideProjectDetail'/>

  <TaskDetail
    v-model:visible='visibleTaskDetail'
    :task-id='selectedTask?.id'/>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import { computed, inject, type PropType, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { StatusType } from '@/apps/work/model/configWorkStatus';
import { type Participant, type SearchTaskInput, type Task } from '@/apps/work/model/task';
import { TaskPriority } from '@/apps/work/model/work';
import { useTaskStore } from '@/apps/work/store/task';
import ProjectDetail from '@/apps/work/views/project/component/detail/ProjectDetail.vue';
import RemainingTime from '@/apps/work/views/task/component/table/RemainingTime.vue';
import { overdueClass } from '@/apps/work/views/task/component/task-utils';
import TaskDetail from '@/apps/work/views/task/component/TaskDetail.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import EventBus from '@/common/helpers/event-bus';
import { filterThenMap } from '@/common/helpers/extension/array.extension';
import { formatDate } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

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
  hideProjectName: {
    type: Boolean,
    default: false
  },
  expandColumn: {
    type: Array as PropType<any>,
    default: [] as []
  },
  isAdminSearch: {
    type: Boolean,
    default: false
  },
  disableByStatus: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits<{
  (e: 'editTask', taskId: string): void
  (e: 'addTaskToPhase', phaseId: string | undefined): void
}>();

const searchInput = defineModel<SearchTaskInput>('searchInput', { default: {} });
const { t } = useI18n();
const disableModify = inject('disableModifyInProject', ref<string>());
const { user } = storeToRefs(useUserStore());
const {
  mapStatuses,
  statuses,
  filterStatusId,
  mapStatusesCount
} = storeToRefs(useTaskStore());
const { refetchStatus } = useTaskStore();
const selectedTask = ref<any>();
const visibleTaskDetail = ref<boolean>(false);
const loadingTable = ref(true);
const tabMenuStatus = computed(() => {
  const rs = statuses.value.map((item) => ({
    label: item.name,
    id: item.id,
    command: () => {
      changeTabCommand(item.id);
    }
  }));
  rs.unshift({
    label: t('common.all'),
    id: 'ALL',
    command: () => {
      changeTabCommand('ALL');
    }
  });
  return rs;
}
);

// watchEffect(() => {
//   setTimeout(() => {
//     loadingTable.value = props.isLoading;
//   }, 1000);
// });

function changeTabCommand(statusId: string) {
  filterStatusId.value = statusId;
  searchInput.value.taskStatusId = [statusId];
}

const visibleProjectDetail = ref<boolean>(false);
const selectedProjectId = ref<string>();

function showDialogDetailProject(projectId: string | undefined) {
  if (projectId) {
    selectedProjectId.value = projectId;
    visibleProjectDetail.value = true;
  }
}

function rowClick(event: DataTableRowClickEvent) {
  const task = event.data as Task;
  selectedTask.value = task;
  EventBus.emit('showTaskDetail', { id: task.id });
}

// function workNameClick(data: Task) {
//   selectedTask.value = props.tasks.find(e => e.id === data.id);
//   EventBus.emit('showTaskDetail', { id: data.id });
// }

function workNameClick(data: Task) {
  selectedTask.value = props.tasks.find(e => e.id === data.id);
  visibleTaskDetail.value = true;
}

refetchStatus();

function toggleMenu(event: Event, task: Task) {
  selectedTask.value = task;
  EventBus.emit('toggleTaskMenu', {
    event: event,
    task: task
  });
}

function hideProjectDetail() {
  EventBus.emit('refetchMyWork');
}

function classTextColorBaseBackground(background: string) {
  const color = calculateColorBasedOnBackgroundColor(background);
  if (color === '#000000') {
    return 'text-dark';
  } else {
    return 'text-light';
  }
}
</script>

<style lang='scss' scoped>
:deep(.group-avatar-container) {
  justify-content: center;
}

:deep(.avatar-container) {
  justify-content: center;
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

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
  padding: 0.75rem 1rem !important;
}
</style>