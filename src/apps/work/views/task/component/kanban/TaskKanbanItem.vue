<template>
  <div
    class='flex flex-column gap-2 justify-content-between kanban-item p-3'
    :draggable='true'>
    <div class='align-items-center flex justify-content-between'>
      <span
        class='font-semibold task-name'
        @click='showTaskDetail'>
        {{ task.name }}
      </span>
      <AppIcon
        v-if='!isAdminSearch && !disableByStatus && !disableModify'
        class='cursor-pointer'
        name='more_vert'
        size='1.5'
        @click='toggleMenu'>
      </AppIcon>
    </div>

    <div>

    </div>
    <!--  Avatar-->
    <div class='flex justify-content-between'>
      <TaskDetailRightCorner
        :model-value='task'>

        <template #status-badge>
          <div></div>
        </template>
      </TaskDetailRightCorner>
      <!--      <AppGroupAvatar-->
      <!--        avatar-size='2.5'-->
      <!--        :user-ids='[...new Set([task?.assignerId||"",...task.participants?.map(e=>e.participantId)||[]])]'-->
      <!--        :users-highlight='[task?.assignerId||""]'>-->
      <!--      </AppGroupAvatar>-->
      <ProgressRing
        :progress='task?.percent || 0'/>
    </div>
    <!--  Other-->
    <div class='flex justify-content-between'>
      <div>
        <div class='flex justify-content-between'>
          <div class='flex gap-2'>
            <div
              v-tooltip='"Trao đổi"'
              class='align-items-center cursor-pointer flex'
              @click='showTaskDetail'>
              <AppIcon
                name='chat_bubble'
                size='1.5'
                text/>
              {{ task?.commentCount || 0 }}
            </div>
            <div
              v-tooltip='"Tệp đính kèm"'
              class='align-items-center cursor-pointer flex'
              @click='openAttachmentTab'>
              <AppIcon
                name='attach_file'
                size='1.5'
                text/>
              {{ task?.taskAttachments?.length || 0 }}
            </div>
            <div
              v-tooltip='"Checklist"'
              class='align-items-center cursor-pointer flex'
              @click='showTaskDetail'>
              <AppIcon
                name='checklist'
                size='1.5'
                text/>
              {{ task?.checkLists?.length || 0 }}
            </div>
          </div>
        </div>
      </div>
      <div class='align-items-center flex ml-6 text-right text-xs'>
        <AppIcon
          name='schedule'
          size='1.5'
          text/>
        <div
          v-if='task?.startTime || task?.dueTime'
          v-tooltip="`${formatDate(task?.startTime, 'DD/MM/yyyy')} - ${formatDate(task?.dueTime, 'DD/MM/yyyy')}`">
          {{ formatDate(task?.startTime, 'DD/MM/yyyy') }} - {{
            formatDate(task?.dueTime, 'DD/MM/yyyy')
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { inject, type PropType, ref } from 'vue';

import { type Task } from '@/apps/work/model/task';
import TaskDetailRightCorner from '@/apps/work/views/task/component/TaskDetailRightCorner.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';
import EventBus from '@/common/helpers/event-bus';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    default: () => ({})
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

const disableModify = inject('disableModifyInProject', ref<boolean>());

function toggleMenu(event: Event) {
  EventBus.emit('toggleTaskMenu', {
    event: event,
    task: props.task
  });
}

function showTaskDetail() {
  EventBus.emit('showTaskDetail', { id: props.task.id });
}

function openAttachmentTab() {
  EventBus.emit('showTaskDetail', {
    id: props.task.id,
    tabIndex: 1
  });
}
</script>

<style scoped>
.task-name:hover {
  cursor: pointer;
  color: var(--blue-400) !important;
}

.kanban-item {
  background-color: var(--surface-a);
  touch-action: pan-x;
  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: var(--surface-300);
  }
}
</style>