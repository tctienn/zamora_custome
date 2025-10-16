<template>
  <div
    class='overflow-auto surface-0'
    style='height: 100%'>
    <DataTable
      v-model:expandedRows='expandedRowGroups'
      v-model:selection='selectedPhase'
      class='custom-table'
      data-key='id'
      :highlight-on-select='true'
      :row-class='()=>"row-phase"'
      :row-hover='true'
      table-style='min-width: 60rem'
      :value='tasksAfterMerge'
      @row-collapse='onRowGroupCollapse'
      @row-expand='onRowGroupExpand'>
      <Column
        class='w-1rem'
        expander
        :header='"#"'/>
      <Column
        body-class='need-expand'
        class='w-3'
        header='Tên công việc'>
        <template #body='{data: {id,name, fromDate,toDate}}'>
          <div class='flex gap-2'>
            <div
              class='font-semibold text-blue-500'>
              {{ name }}
            </div>
            <span
              class='font-normal'
              style='color: rgb(73, 80, 87)'> {{
                id != 'undefined' ? '(' + moment(fromDate).format('DD/MM/YYYY') + ' - ' + moment(toDate).format('DD/MM/YYYY') + ')' : ''
              }}</span>
          </div>

        </template>
      </Column>

      <Column
        class='text-center w-1'
        :header='"Giao việc"'>
      </Column>
      <Column
        class='w-1'
        :header='"Thực hiện"'>
      </Column>
      <Column
        class='w-1'
        :header='"Tiến độ"'>
      </Column>
      <Column
        class='pr-0 w-2'
        :header='"Hạn"'>
      </Column>
      <Column
        body-class='text-center'
        class='w-2'
        :header='"Ngày cập nhật"'>
      </Column>
      <Column
        body-class='text-center'
        class='w-1'
        :header='"Trạng thái"'>
      </Column>

      <template #expansion='slotProps'>
        <div class='p-0'>
          <DataTable
            v-model:selection='selectedTask'
            :pt='{
              "thead": {
                "style": "display: none"
              }
            }'
            :value='slotProps.data.tasks'>
            <Column
              body-class='text-center'
              class='w-1rem'
              selection-mode='single'>
              <template #body='{index}'>
                {{ index + 1 }}
              </template>
            </Column>
            <Column
              class='w-3'>
              <template #body='{data}'>
                <div class='ml-5'>
                  <span
                    class='cursor-pointer font-semibold hover:text-blue-400'
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
                      v-tooltip.top='"Thời gian thực hiện công việc"'>
                      {{ formatDate(data?.startTime, 'DD/MM/yyyy HH:mm') }} - {{
                        formatDate(data?.dueTime, 'DD/MM/yyyy HH:mm')
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
              class='text-center w-1'>
              <template #body='{data}'>
                <AppUser
                  v-if='data?.assignerId'
                  avatar-size='2.5'
                  class='pl-0'
                  is-highlight
                  overlay-visible
                  :user-id='data?.assignerId'>
                </AppUser>
              </template>
            </Column>
            <Column class='w-1'>
              <template #body='{data}'>
                <div class='pl-0'>
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
            <Column class='pl-2 w-1'>
              <template #body='{data}'>
                <div class='align-content-center'>
                  <ProgressRing
                    :progress='data?.percent||0'></ProgressRing>
                </div>
              </template>

            </Column>

            <Column
              body-class='text-center'
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
              class='pl-4 w-2'>
              <template #body='{data}'>
                <div class='pl-5'>
                  {{ formatDate(data?.lastModifiedTime) }}
                </div>
              </template>
            </Column>
            <Column
              body-class='text-left'
              class='w-1'>
              <template #body='{data}'>
                <div class='pl-0'>
                  <span
                    class='status-badge'
                    :style="{'background-color':`#${mapStatuses[data.statusId]?.color||'ffffff'}`,
                             'color':calculateColorBasedOnBackgroundColor('#'+mapStatuses[data.statusId]?.color||'#ffffff')}">
                    {{ data?.statusName }}
                  </span>

                </div>
              </template>
            </Column>
            <Column
              body-class='text-center'>
              <template #body='{data}'>
                <ButtonIcon
                  v-if='!disableByStatus && !disableModify'
                  v-tooltip.top='t("common.action")'
                  class='text-color'
                  icon='more_horiz'
                  icon-size='1.7'
                  rounded
                  text
                  @click='toggleMenu($event,data)'/>
              </template>
            </Column>
            <Column></Column>
          </DataTable>
        </div>
      </template>
      <Column
        body-class='w-1'>
        <template #body='{data}'>
          <div class='flex gap-2'>
            <AppIcon
              v-if='!disableByStatus'
              v-tooltip.top="'Thêm công việc'"
              class='add-task-phase cursor-pointer'
              name='add_circle'
              outlined
              size='1.6'
              @click='addTaskToPhase(data)'>
            </AppIcon>

            <AppIcon
              v-if='data?.id != "undefined" && !disableByStatus'
              v-tooltip.top="'Chỉnh sửa giai đoạn'"
              class='add-task-phase cursor-pointer'
              name='edit'
              outlined
              size='1.6'
              @click='editPhase(data)'>
            </AppIcon>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>

  <TaskDetail
    v-model:visible='visibleTaskDetail'
    :task-id='selectedTask?.id'/>

  <ProjectDetail
    v-model:visible='visibleProjectDetail'
    :project-id='selectedProjectId'/>

  <FormProjectPhase
    v-model:visible='visibleFormPhase'
    :phase-id='selectedPhase?.id'
    :project-id='props.projectId'/>
</template>

<script setup lang='ts'>
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { inject, onMounted, onUnmounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getPhasesByProjectId } from '@/apps/work/api/graphql/phase';
import { StatusType } from '@/apps/work/model/configWorkStatus';
import type { ProjectPhase } from '@/apps/work/model/phase';
import type { Participant, Task } from '@/apps/work/model/task';
import { TaskPriority } from '@/apps/work/model/work';
import { useTaskStore } from '@/apps/work/store/task';
import ProjectDetail from '@/apps/work/views/project/component/detail/ProjectDetail.vue';
import FormProjectPhase from '@/apps/work/views/project/component/FormProjectPhase.vue';
import RemainingTime from '@/apps/work/views/task/component/table/RemainingTime.vue';
import TaskDetail from '@/apps/work/views/task/component/TaskDetail.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import EventBus from '@/common/helpers/event-bus';
import { filterThenMap } from '@/common/helpers/extension/array.extension';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps({
  projectId: {
    type: String,
    default: null
  },
  tasks: {
    type: Array as PropType<Task[]>,
    default: [] as Task[]
  },
  hideProjectName: {
    type: Boolean,
    default: false
  },
  expandColumn: {
    type: Array as PropType<any>,
    default: [] as []
  },
  disableByStatus: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits<{
  (e: 'addTaskToPhase', phaseId: string | undefined): void
}>();
const disableModify = inject('disableModifyInProject', ref<string>());
const phases = ref();
const tasksAfterMerge = ref();
const visibleProjectDetail = ref<boolean>(false);
const visibleFormPhase = ref<boolean>(false);
const selectedProjectId = ref<string>();
const visibleTaskDetail = ref<boolean>(false);
const selectedTask = ref<any>();
const {
  mapStatuses,
  statuses
} = storeToRefs(useTaskStore());
const { t } = useI18n();
const expandedRowGroups = ref(props.expandColumn);
const {
  onResult: getPhasesResult,
  refetch: getPhasesRefetch
} = getPhasesByProjectId(props.projectId);
const selectedPhase = ref();

getPhasesResult((res) => {
  phases.value = res.data.getPhasesByProjectId;
  tasksAfterMerge.value = mapPhasesWithTasks(phases.value, props.tasks);
});

const onRowGroupCollapse = (event: any) => {
};

const onRowGroupExpand = (event: any) => {
};

function mapPhasesWithTasks(phases: any[], tasks: Task[]) {
  const unassignedTasks = tasks.filter((task) => task.phaseId === null);

  const phaseWithTasks: any[] = phases.map((phase) => {
    const relatedTasks = tasks.filter((task) => task.phaseId === phase.id);
    return {
      ...phase,
      tasks: relatedTasks,
    };
  });

  if (unassignedTasks.length > 0) {
    phaseWithTasks.push({
      id: 'undefined',
      name: 'Không xác định',
      tasks: unassignedTasks,
    });
  }

  return phaseWithTasks;
}

function workNameClick(data: Task) {
  selectedTask.value = props.tasks.find(e => e.id === data.id);
  visibleTaskDetail.value = true;
}

function toggleMenu(event: Event, task: Task) {
  selectedTask.value = task;
  selectedPhase.value = {};
  EventBus.emit('toggleTaskMenu', {
    event: event,
    task: task
  });
}

function showDialogDetailProject(projectId: string | undefined) {
  if (projectId) {
    selectedProjectId.value = projectId;
    visibleProjectDetail.value = true;
  }
}

function addTaskToPhase(data: ProjectPhase) {
  let id: string | undefined = undefined;
  if (data.id != 'undefined') {
    id = data.id;
  }
  emits('addTaskToPhase', id);
}

function editPhase(phase: any) {
  selectedPhase.value = phase;
  selectedTask.value = {};
  visibleFormPhase.value = true;
}

function expandRow() {
  const tds = document.querySelectorAll('.custom-table td.need-expand');
  tds.forEach(td => {
    const parentRow = td.parentElement as HTMLTableRowElement;

    if (parentRow) {
      // Mở rộng td hiện tại thành 5 cột
      (td as HTMLTableCellElement).colSpan = 5;

      // Lấy tất cả các td anh em sau nó và xóa 4 ô tiếp theo
      let nextSibling = td.nextElementSibling;
      let count = 4; // Xóa 4 ô tiếp theo

      while (nextSibling && count > 0) {
        const nextTd = nextSibling;
        nextSibling = nextSibling.nextElementSibling; // Lưu ô tiếp theo trước khi xóa
        parentRow.removeChild(nextTd); // Xóa ô hiện tại
        count--;
      }
    }
  });
}

onMounted(() => {
  EventBus.on('refetchPhases', getPhasesRefetch);

  setTimeout(expandRow, 200);
});

onUnmounted(() => {
  EventBus.on('refetchPhases', getPhasesRefetch);
});
</script>

<style lang='scss' scoped>
.row-phase:hover {
  & .add-task-phase {
    opacity: 1
  }
}

.add-task-phase {
  opacity: 0
}

:deep(.p-datatable-row-expansion > td) {
  padding: 0
}

.overdue {
  background: var(--red-300)
}

.on-going {
  background: var(--green-300)
}

:deep(.p-datatable-emptymessage > td) {
  padding: 0;
  border-bottom: none
}
</style>

<script lang='ts'>
export default { name: 'GroupPhase' };
</script>