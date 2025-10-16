<template>
  <TreeTable
    v-model:selection-keys='selection'
    data-key='id'
    :selection-mode="'single'"
    :value='tree'>
    <Column
      expander
      :header='"Tên công việc"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
        <span
          class='align-content-center flex-column inline-flex'
          @click='workNameClick(data)'>
          <span>
            <i
              v-if='data?.priority==TaskPriority.HIGH'
              class='mr-2 pi pi-star-fill'
              style='color:#eedb08'></i>
            <span class='font-semibold hover:text-blue-400 word-break-break-word'>
              {{ data?.name }}
            </span></span>

          <span
            v-if='data?.startTime || data?.dueTime'
            v-tooltip.top='t("work.task.taskDuration")'
            class='inline-flex task-duration word-break-break-word'>
            {{ formatDate(data?.startTime, 'DD/MM/yyyy') }} - {{
              formatDate(data?.dueTime, 'DD/MM/yyyy')
            }}
          </span>
        </span>

      </template>
    </Column>
    <Column
      class='col-1'
      :header='"Giao việc"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
        <div class='flex justify-content-center'>
          <AppUser
            v-if='data?.assignerId'
            avatar-size='2.5'
            is-highlight
            :user-id='data?.assignerId'>
          </AppUser>
        </div>
      </template>
    </Column>
    <Column
      class='col-1'
      :header='"Thực hiện"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
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
      class='col-1'
      :header='"Tiến độ"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
        <ProgressRing
          :progress='data?.percent||0'></ProgressRing>
      </template>

    </Column>
    <Column
      body-class='text-center '
      class='col-1'
      :header='"Hạn"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
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
      class='col-1'
      :header='"Ngày cập nhật"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
        {{ formatDate(data?.lastModifiedTime) }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      class='col-2'
      :header='"Trạng thái"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
        <span
          class='status-badge'
          :style="{'background-color':`#${mapStatuses[data.statusId]?.color||'ffffff'}`,
                   'color':calculateColorBasedOnBackgroundColor('#'+mapStatuses[data.statusId]?.color||'#ffffff')}">
          {{ data?.statusName }}
        </span>
      </template>
    </Column>
    <Column
      v-if='!isAdminSearch && !disableModify'
      body-class='text-center'
      class='col-1'
      :header='"Thao tác"'
      header-class='text-center'>
      <template #body='{node:{data}}'>
        <Button
          v-tooltip.top='t("common.action")'
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='toggleMenu($event,data)'></Button>
      </template>
    </Column>
  </TreeTable>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { computed, inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Participant, Task } from '@/apps/work/model/task';
import { TaskPriority } from '@/apps/work/model/work';
import { useTaskStore } from '@/apps/work/store/task';
import { overdueClass } from '@/apps/work/views/task/component/task-utils';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import EventBus from '@/common/helpers/event-bus';
import { filterThenMap } from '@/common/helpers/extension/array.extension';
import { getDateDifference } from '@/common/helpers/time-util';
import { formatDate, listToTree } from '@/common/helpers/utils';

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
defineEmits<{
  (e: 'addTaskToPhase', phaseId: string | undefined): void
}>();
const disableModify = inject('disableModifyInProject', ref<string>());
const {
  mapStatuses,
  filterStatusIds,
  statuses
} = storeToRefs(useTaskStore());
filterStatusIds.value = statuses.value.map(e => e.id);
const { t } = useI18n();
const tree = computed<TreeNode[]>(() => {
  return listToTree(props.tasks.map(e => {
    return {
      id: e.id,
      parentId: e.parentId,
      children: [],
      data: e,
      styleClass: overdueClass(e, mapStatuses.value)
    };
  }), {
    id: 'id',
    parentId: 'parentId',
    children: 'children',
  });
});
const selection = ref<Record<string, boolean>>();

function toggleMenu(event: Event, task: Task) {
  selection.value = { [(task.id || '') as string]: true };
  EventBus.emit('toggleTaskMenu', {
    event: event,
    task: task
  });
}

function workNameClick(data: Task) {
  EventBus.emit('showTaskDetail', { id: data.id });
}

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