<template>
  <div class='column-gap-2 flex flex-row h-full'>
    <FullCalendar
      class='flex-1'
      :options='options'>
    </FullCalendar>
    <div class='flex flex-column pl-3 pr-5 row-gap-3'>
      <div
        v-for='taskStatus in statuses'
        :key='taskStatus.id'>
        <div
          class='align-items-center border-1 border-round column-gap-2 cursor-pointer flex flex-row p-2 p-component'
          :style='{
            "backgroundColor": filterStatusIds.find(e=>e==taskStatus.id) ? `#${taskStatus.color}`:"#00000000",
            "color":calculateColorBasedOnBackgroundColor(filterStatusIds.find(e=>e==taskStatus.id) ? `#${taskStatus.color}`:"#00000000")
          }'
          @click='toggleFilter(taskStatus)'>
          <!--          <div-->
          <!--            class='border-circle h-1rem p-component w-1rem'-->
          <!--            :style='{"backgroundColor": `#${taskStatus.color}` }'></div>-->
          <span>{{ taskStatus.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import type { CalendarOptions, DateSelectArg, DatesSetArg, EventClickArg, EventMountArg } from '@fullcalendar/core';
import enLocale from '@fullcalendar/core/locales/en-au';
import viLocale from '@fullcalendar/core/locales/vi';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { find, map } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';

import type { TaskStatus } from '@/apps/work/model/configWorkStatus';
import type { Task } from '@/apps/work/model/task';
import { useTaskStore } from '@/apps/work/store/task';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import EventBus from '@/common/helpers/event-bus';

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

const emits = defineEmits(['open-quick-save-task-dialog']);

const {
  statuses,
  mapStatuses,
  filterStatusIds
} = storeToRefs(useTaskStore());

function toggleFilter(taskStatus: TaskStatus) {
  const index = filterStatusIds.value.findIndex(e => e == taskStatus.id);
  if (index != -1) {
    filterStatusIds.value.splice(index, 1);
  } else {
    filterStatusIds.value = [...filterStatusIds.value, taskStatus.id];
  }
}

const calendarEvents = computed(() => {
  return map(props.tasks, (task) => {
    const color = task.statusId ? `#${mapStatuses.value[task.statusId]?.color}` : '';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

    return {
      id: task.id,
      title: task.name,
      start: task.startTime,
      end: task.dueTime,
      description: task.description,
      location: '',
      backgroundColor: color ?? primaryColor,
      borderColor: color ?? primaryColor,
      textColor: '#ffffff'
    };
  });
});

const options = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialDate: new Date(),
  initialView: '',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  height: '100%',
  // height: 'auto',
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  locales: [enLocale, viLocale],
  locale: viLocale,
  eventClick: (arg: EventClickArg) => {
    //TODO: trigger khi click event, open detail dialog
    // console.log('event', arg.event.extendedProps);
  },
  select: (arg: DateSelectArg) => {
    emits('open-quick-save-task-dialog');
    return arg;
  },
  eventDidMount: (arg: EventMountArg) => {
    const taskId = arg.event.id;
    arg.el.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      const task = find(props.tasks, ['id', taskId]);
      toggleMenu(event, task as Task);
      //TODO: trigger khi right click event, open context menu
    });
  },
  datesSet: (arg: DatesSetArg) => {
    //TODO: trigger khi set data trong calendar, dùng để update events
    // const { start, end } = event;
    // console.log(event);
    // emits('update-range', [start, end]);
  },
  events: calendarEvents.value
}));

function toggleMenu(e: Event, task: Task) {
  EventBus.emit('toggleTaskMenu', {
    event: e,
    task: task
  });
}
</script>

<style lang='scss' scoped>
:deep(.fc-popover.fc-more-popover) {
  z-index: 1000;
}
</style>