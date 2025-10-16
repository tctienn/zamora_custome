<template>
  <component
    :is='viewerType'
    v-if='viewerType'
    :active-events='activeEvents'
    :deleted-events='deletedEvents'
    :item='event'
    @delete-event='deleteEvent'
    @remove-event='removeEvent'
    @restore-event='restoreEvent'/>
</template>

<script setup lang='ts'>
import { concat, filter, findIndex, get, map, orderBy } from 'lodash';
import { inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import {
  deleteEventGraphql,
  getSubjectEventsLazyGraphql,
  removeEventGraphql,
  restoreEventGraphql
} from '@/common/api/graphql/event-graphql';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Group } from '@/common/model/group';
import { Direction, type Pageable } from '@/common/model/query';
import { type Event, EventType } from '@/common/model/widget/event';

const { moment } = useMoment();

const viewerType = ref('');
const delayDisplayTimeout = setTimeout(() => {
  viewerType.value = 'EcmGroupEventWidget';
  getEventsLoad();
}, 500);
const group = inject('group', ref<Group>({} as Group));
const event = ref<Event>({} as Event);

const activeEvents = ref<Event[]>([]);
const deletedEvents = ref<Event[]>([]);

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [{
    property: 'date',
    direction: Direction.DESC
  },
  {
    property: 'fromAt',
    direction: Direction.ASC
  }]
});

const { onResult: getEventsResult, load: getEventsLoad, refetch: getEventsRefetch } = getSubjectEventsLazyGraphql({
  subjectId: group.value.id,
  isDeleted: false,
  types: [EventType[EventType.GROUP]],
  fromDate: moment().startOf('week').format('YYYY-MM-DD'),
  toDate: moment().endOf('week').format('YYYY-MM-DD'),
  pageable: pageable
});

getEventsResult((response) => {
  if (viewerType.value === 'EcmGroupEventWidget') {
    activeEvents.value = map(get(response, 'data.subjectEvents.edges', []), 'node');
  } else {
    deletedEvents.value = map(get(response, 'data.subjectEvents.edges', []), 'node');
  }
});

function changeViewerType({ type, item }: { type: string, item: Event }) {
  viewerType.value = type;
  event.value = item;
}

watch(() => viewerType.value, () => {
  if (['EcmGroupEventWidget', 'EcmGroupEventWidgetTrash'].includes(viewerType.value)) {
    getEventsRefetch({
      subjectId: group.value.id,
      isDeleted: viewerType.value !== 'EcmGroupEventWidget',
      types: [EventType[EventType.GROUP]],
      fromDate: moment().startOf('week').format('YYYY-MM-DD'),
      toDate: moment().endOf('week').format('YYYY-MM-DD'),
      pageable: pageable
    });
  }
});

function filterEvent({ dates, types }: { dates: Date[], types: string[] }) {
  getEventsRefetch({
    subjectId: group.value.id,
    isDeleted: viewerType.value !== 'EcmGroupEventWidget',
    types,
    fromDate: dates.length ? moment(dates[0]).isValid() ? moment(dates[0]).format('YYYY-MM-DD') : null : null,
    toDate: dates.length > 1 ? moment(dates[1]).isValid() ? moment(dates[1]).format('YYYY-MM-DD') : null : null,
    pageable: pageable
  });
}

function deleteEvent(eventId: string) {
  const { mutate: deleteEventMutate, onDone: deleteEventDone } = deleteEventGraphql();
  deleteEventMutate({ eventId });

  deleteEventDone(() => {
    toastSuccess({});
    const eventIndex = findIndex(activeEvents.value, ['id', eventId]);
    if (eventIndex >= 0) {
      deletedEvents.value = orderBy(concat(deletedEvents.value, [activeEvents.value[eventIndex]]));
      activeEvents.value = filter(activeEvents.value, (event) => event.id !== eventId);
    }
  });
}

function restoreEvent(eventId: string) {
  const { mutate: restoreEventMutate, onDone: restoreEventDone } = restoreEventGraphql();
  restoreEventMutate({ eventId });

  restoreEventDone(() => {
    toastSuccess({});
    const eventIndex = findIndex(deletedEvents.value, ['id', eventId]);
    if (eventIndex >= 0) {
      activeEvents.value = orderBy(concat(activeEvents.value, [deletedEvents.value[eventIndex]]));
      deletedEvents.value = filter(deletedEvents.value, (event) => event.id !== eventId);
    }
  });
}

function removeEvent(eventId: string) {
  const { mutate: removeEventMutate, onDone: removeEventDone } = removeEventGraphql();
  removeEventMutate({ eventId });

  removeEventDone(() => {
    toastSuccess({});
    deletedEvents.value = filter(deletedEvents.value, (event) => event.id !== eventId);
  });
}

onMounted(() => {
  EventBus.on('ecm-group-delete-event', deleteEvent);
  EventBus.on('ecm-group-restore-event', restoreEvent);
  EventBus.on('ecm-group-remove-event', removeEvent);

  EventBus.on('ecm-group-filter-event', filterEvent);
  EventBus.on('ecm-group-change-event-viewer-type', changeViewerType);
});

onUnmounted(() => {
  EventBus.off('ecm-group-delete-event', deleteEvent);
  EventBus.off('ecm-group-restore-event', restoreEvent);
  EventBus.off('ecm-group-remove-event', removeEvent);

  EventBus.off('ecm-group-filter-event', filterEvent);
  EventBus.off('ecm-group-change-event-viewer-type', changeViewerType);

  clearTimeout(delayDisplayTimeout);
});
</script>

<script lang='ts'>
import EcmGroupEventInfo
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupEventInfo.vue';
import EcmGroupEventWidget
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupEventWidget.vue';
import EcmGroupEventWidgetTrash
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupEventWidgetTrash.vue';
import EcmGroupSaveEvent
  from '@/apps/ecm/views/group-documents/components/sidebar/widgets/event/EcmGroupSaveEvent.vue';

export default {
  name: 'EcmGroupEvent',

  components: {
    EcmGroupEventWidget,
    EcmGroupEventWidgetTrash,
    EcmGroupSaveEvent,
    EcmGroupEventInfo
  }
};
</script>