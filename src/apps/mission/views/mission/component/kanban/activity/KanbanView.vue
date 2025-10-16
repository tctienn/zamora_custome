<template>
  <div class='column-gap-5 flex flex-row h-full kanban overflow-x-auto pb-2'>
    <div
      v-for='column in columns'
      :key='column.id'
      class='flex flex-1 flex-column h-full row-gap-2'
      style='min-width: 25%'>
      <div class='align-items-center border-round-sm flex justify-content-between p-2 py-2 surface-card'>
        <span class='font-bold'>{{ column.title }} ({{
          (column.listActivity.length) ?? 0
        }})</span>
      </div>

      <div
        class='border-round-sm h-full kanban-dropzone overflow-y-auto surface-0'
        @dragenter='dropTaskEnter'
        @dragleave='dropTaskLeave'
        @dragover='$event.preventDefault()'>
        <div class='flex flex-column min-h-full row-gap-3'>
          <template
            v-for='(activity, index) in column.listActivity'
            :key='index'>
            <div
              draggable='true'
              @contextmenu='toggleMenu($event, activity)'
              @drag='dragWork'
              @dragstart='dragWorkStart(activity, $event)'>
              <slot
                :activity='activity'
                name='kanbanItem'>
              </slot>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType, ref } from 'vue';

import type { ActivityInterface } from '@/apps/mission/model/activity/activity';
import { StatusMission } from '@/apps/mission/model/mission/mission';
import EventBus from '@/common/helpers/event-bus';
const props = defineProps({
  activitys: {
    type: Array as PropType<ActivityInterface[]>,
    default: () => []
  }
});

const board = ref({
  columns: [
    {
      id: 'col-1',
      title: 'Tạo mới',
      type: StatusMission.NEW
    },
    {
      id: 'col-2',
      title: 'Đang thực hiện',
      type: StatusMission.IN_PROGRESS 
    },
    {
      id: 'col-3',
      title: 'Chờ gia hạn',
      type: StatusMission.WAITING_FOR_APPROVAL_EXTENSION_DEADLINE_REQUEST 
    },
    {
      id: 'col-4',
      title: 'Hoàn thành',
      type: StatusMission.COMPLETED 
    }
  ]
});

const columns = computed(() =>
  board.value.columns.map(c => ({
    ...c,
    listActivity: props.activitys.filter(m => m.status === c.type)
  }))
);

function dragWorkStart(mission: ActivityInterface, event: DragEvent) {
  event.dataTransfer?.clearData();
  event.dataTransfer?.setData('text/plain', JSON.stringify(mission));
}

function dragWork(event: DragEvent) {
  event.preventDefault();
  const kanban = document.getElementsByClassName('kanban');
  if (kanban?.length) {
    const scrollLeft = kanban[0].scrollLeft;
    if (event.pageX > kanban[0].clientWidth - 100) {
      kanban[0].scroll({ left: scrollLeft + 10 });
    }
    if (event.pageX < 100) {
      kanban[0].scroll({ left: scrollLeft - 10 });
    }
  }
}

function dropTaskEnter(event: DragEvent) {
  const target = (event.target as HTMLElement).closest('.kanban-dropzone');
  if (target) {
    target.classList.add('droppable-zone');
  }
}

function dropTaskLeave(event: DragEvent) {
  const target = (event.target as HTMLElement).closest('.kanban-dropzone');
  if (target) {
    target.classList.remove('droppable-zone');
  }
}

function toggleMenu(e: Event, activity: ActivityInterface) {
  EventBus.emit('toggleTaskMenu', {
    event: e,
    activity 
  });
}
</script>

<style lang="scss" scoped>
.kanban-dropzone {
  > div {
    border: 2px dashed transparent;
  }
  &.droppable-zone {
    > div {
      border: 2px dashed var(--primary-400);
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
