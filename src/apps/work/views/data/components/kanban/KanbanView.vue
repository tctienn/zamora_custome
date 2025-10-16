<template>
  <div class='column-gap-5 flex flex-row h-full kanban overflow-x-auto pb-2'>
    <div
      v-for='column in columns'
      :key='column.id'
      class='flex flex-1 flex-column h-full row-gap-2'
      style='min-width: 25%'>
      <div
        class='align-items-center border-round-sm flex flex-row justify-content-between p-2 py-2 surface-card w-full'>
        <div class='align-items-center flex flex-row'>
          <!--          <ButtonIcon-->
          <!--            v-if='startColumn.id === column.id'-->
          <!--            class='align-self-start flex-shrink-0 p-1'-->
          <!--            icon='add_circle'-->
          <!--            rounded-->
          <!--            text-->
          <!--            @click='emits("open-quick-save-task-dialog")'/>-->
          <span class='font-bold'>{{ column.title }} ({{
            (mapStatusesCount[column.id] || column.listTask.length) ?? 0
          }})</span>
        </div>

        <!--        <ButtonIcon-->
        <!--          class='align-self-start flex-shrink-0 p-1'-->
        <!--          icon='more_vert'-->
        <!--          rounded-->
        <!--          text/>-->
      </div>
      <div
        class='border-round-sm h-full kanban-dropzone overflow-y-auto surface-0'
        @dragenter='dropTaskEnter'
        @dragleave='dropTaskLeave'
        @dragover='$event.preventDefault()'
        @drop='dropTask($event, column.id)'>
        <div class='flex flex-column min-h-full row-gap-3'>
          <template
            v-for='(task, index) in column.listTask'
            :key='index'>
            <div
              @contextmenu='toggleMenu($event, task)'
              @drag='dragWork'
              @dragstart='dragWorkStart(task, $event)'>
              <slot
                name='kanbanItem'
                :selected-task='selectedTask'
                :show-chip='showChip'
                :task='task'>
                <KanbanItem
                  :selected-task='selectedTask'
                  :task='task'
                  @show-chip='showChip'>
                </KanbanItem>
              </slot>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { find, get, omit } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, type PropType, ref } from 'vue';

import { boardWithoutTask, changeColumn } from '@/apps/work/api/graphql/board';
import type { Board, Column } from '@/apps/work/model/board';
import { BoardType } from '@/apps/work/model/board';
import { StatusType } from '@/apps/work/model/configWorkStatus';
import type { Task, Work } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import KanbanItem from '@/apps/work/views/data/components/kanban/KanbanItem.vue';
import EventBus from '@/common/helpers/event-bus';

const props = defineProps({
  boardType: {
    type: Number as PropType<BoardType>,
    required: true
  },
  tasks: {
    type: Array as PropType<Work[]>,
    default: [] as Work[]
  },
});

const store = useTaskStore();
const { boardType: boardServiceType, mapStatusesCount } = storeToRefs(store);

const board = ref<Board>({ columns: [] });
const columns = computed(() => {
  return board.value.columns.map(c => {
    return {
      ...c,
      listTask: props.tasks.filter(t => taskInColumFn(props.boardType)(t, c))
    };
  });
});

onMounted(() => {
  initBoard();
});

function initBoard() {
  boardWithoutTask(props.boardType).onResult(a => {
    board.value = a.data.boardWithoutTask as Board;
  });
}

function taskInColumFn(type: BoardType): (task: Work, column: Column) => boolean {
  switch (type) {
  case BoardType.PROJECT:
    return (task, column) => task.status === column.type;
  default:
    return (task, column) => task.statusId === column.id;
  }
}

function getDataTransferTask(event: DragEvent) {
  try {
    return JSON.parse(event.dataTransfer?.getData('text') as string) as Task;
  } catch (ex) {
    return null;
  }
}

const {
  mutate: changeColumnMutate,
  onDone: changeColumnDone
} = changeColumn(props.boardType);
changeColumnDone((response) => {
  const task = get(response, 'data.changeColumn', {} as Task);
  store.updateTask(task);
});

function dropTask(event: DragEvent, columnId: string) {
  const task = getDataTransferTask(event);
  removeAllDragOverEffect();
  if (task && task.statusId !== columnId) {
    changeColumnMutate({
      type: BoardType[props.boardType],
      taskId: task.id,
      id: columnId
    });
  }
}

function dropTaskEnter(event: DragEvent) {
  event.preventDefault();
  const target = (event.target as HTMLElement).closest('.kanban-dropzone');
  if (target) {
    // target.classList.remove('surface-border');
    target.classList.add('droppable-zone');
  }
}

function dropTaskLeave(event: DragEvent) {
  removeDragOverEffect(event);
}

function removeAllDragOverEffect() {
  document.querySelectorAll('.kanban-dropzone').forEach(e => {
    e.classList.remove('droppable-zone');
    // e.classList.add('surface-border');
  });
}

function removeDragOverEffect(event: DragEvent) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  if (target?.classList.contains('kanban-dropzone')) {
    target.classList.remove('droppable-zone');
    // target.classList.add('surface-border');
  }
}

const selectedTask = ref(true);

function showChip() {
  // Khi người dùng click vào chấm tròn, hiển thị Chip tương ứng
  selectedTask.value = !selectedTask.value;
}

function dragWorkStart(task: Work, event: DragEvent) {
  event.dataTransfer?.clearData();
  event.dataTransfer?.setData('text/plain', JSON.stringify(task));
}

function dragWork(event: DragEvent) {
  event.preventDefault();
  const kanban = document.getElementsByClassName('kanban');
  if (kanban?.length) {
    if (event.pageX > kanban[0].clientWidth - 100) {
      kanban[0].scroll({ left: kanban[0].scrollLeft + 10 });
    }
    if (event.pageX < kanban[0].clientWidth + 100) {
      kanban[0].scroll({ left: kanban[0].scrollLeft - 10 });
    }
  }
}

function toggleMenu(e: Event, task: Work) {
  EventBus.emit('toggleTaskMenu', {
    event: e,
    task: task
  });
}

</script>

<script lang='ts'>
export default { name: 'KanbanView' };
</script>

<style lang='scss' scoped>
:deep(.kanban) {
  scroll-behavior: smooth;
}

:deep(.kanban-dropzone) {
  &::-webkit-scrollbar {
    display: none;
  }
}

.kanban-dropzone {
  > div {
    border: 2px dashed transparent;
  }

  &.droppable-zone {
    > div {
      border: 2px dashed var(--primary-400)
    }
  }
}
</style>