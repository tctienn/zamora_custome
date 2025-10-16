<template>
  <div class='column-gap-3 flex flex-row h-full w-full'>
    <FullCalendar
      class='flex-grow-1'
      :events='events'
      :options='options'/>

    <div class='flex flex-column row-gap-3'>
      <SelectButton
        aria-labelledby='basic'
        :model-value='displayType'
        :options='displayTypes'
        :unselectable='true'
        @update:model-value='updateDisplayType'>
        <template #option='{option: {icon}}'>
          <AppIcon
            :name='icon'
            size='1.25'/>
        </template>
      </SelectButton>

      <div
        v-for='evenType in reverse(Object.keys(WIDGET_EVENT_COLOR_CONFIGS))'
        :key='evenType'
        class='flex flex-column w-full'>
        <div class='align-items-center column-gap-2 flex flex-row'>
          <div
            class='border-circle h-1rem w-1rem'
            :style='{"backgroundColor": WIDGET_EVENT_COLOR_CONFIGS[evenType as keyof typeof WIDGET_EVENT_COLOR_CONFIGS].backgroundColor}'></div>
          <span>{{ t(`widget.event.${ evenType }`) }}</span>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang='ts'>
import type { CalendarOptions, DateSelectArg, DatesSetArg, EventClickArg } from '@fullcalendar/core';
import enLocale from '@fullcalendar/core/locales/en-au';
import viLocale from '@fullcalendar/core/locales/vi';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { camelCase, find, map, reverse } from 'lodash';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { WIDGET_EVENT_COLOR_CONFIGS } from '@/common/constants/widget';
import type { DisplayType, Event } from '@/common/model/widget/event';

const props = defineProps({
  events: {
    type: Array as PropType<Event[]>,
    default: () => []
  },
  fromDate: {
    type: String,
    default: ''
  },
  toDate: {
    type: String,
    default: ''
  },
  displayTypes: {
    type: Array as PropType<DisplayType[]>,
    required: true
  },
  displayType: {
    type: Object as PropType<DisplayType>,
    required: true
  }
});

const emits = defineEmits(['event-detail', 'edit-event', 'update:displayType']);

const { t } = useI18n();

const calendarEvents = computed(() => {
  return map(props.events, (event) => {
    const colours = WIDGET_EVENT_COLOR_CONFIGS[camelCase(event.type.toString()) as keyof typeof WIDGET_EVENT_COLOR_CONFIGS];

    return {
      id: event.id,
      title: event.name,
      start: `${ event.date }T${ event.fromAt }`,
      end: `${ event.date }T${ event.toAt }`,
      description: event.description,
      location: event.location,
      backgroundColor: colours.backgroundColor,
      borderColor: colours.borderColor,
      textColor: colours.textColor
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
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 3,
  fixedWeekCount: false,
  footerToolbar: false,
  locales: [enLocale, viLocale],
  locale: viLocale,
  eventClick: (evt: EventClickArg) => {
    const event = getEvent(evt.event.id);
    if (event) {
      emits('event-detail', event);
    }
  },
  select: (evt: DateSelectArg) => {
    emits('edit-event', { date: evt.start });
  },
  // selectAllow: (selectInfo) => {
  //   return moment(selectInfo.end).diff(moment(selectInfo.start), 'days') === 1;
  // },
  datesSet: (event: DatesSetArg) => {
    // const { start, end } = event;
    // console.log(event);
    // emits('update-range', [start, end]);
  },
  events: calendarEvents.value
}));

function getEvent(eventId: string) {
  return find(props.events, ['id', eventId]);
}

function updateDisplayType(value: DisplayType) {
  emits('update:displayType', value);
}
</script>

<script lang='ts'>
export default { name: 'EventWidgetCalendar' };
</script>

<style scoped lang='scss'>
:deep(.fc.fc-media-screen) {
  .fc-header-toolbar {
    .fc-toolbar-title {
      text-transform: lowercase;
    }

    .fc-toolbar-title::first-letter {
      text-transform: uppercase;
    }
  }
}
</style>