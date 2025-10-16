<template>
  <div class='flex flex-column h-full row-gap-3'>
    <EventWidgetHeader
      v-model:display-type='displayType'
      :display-types='displayTypes'
      :event-type='eventType'
      :range-filter='[moment(rangeFilter.fromDate).toDate(), moment(rangeFilter.toDate).toDate()]'
      :range-type='rangeType'
      @search-keyword='searchKeyword'
      @show-save-event-dialog='showSaveEventDialog'
      @update-event-type='updateEventType'
      @update-range='updateRange'
      @update-range-type='updateRangeType'/>

    <component
      :is='viewerType'
      v-model:display-type='displayType'
      :display-types='displayTypes'
      :events='events'
      :from-date='rangeFilter.fromDate'
      :to-date='rangeFilter.toDate'
      @delete-event='deleteEvent'
      @edit-event='showEditEventDialog'
      @event-detail='showEventDetailDialog'/>
  </div>

  <SaveEventWidgetDialog
    v-if='saveEventDialogVisible'
    :dialog-visible='saveEventDialogVisible'
    :item='event'
    @hide-dialog='hideEditEventDialog'
    @reload='getEventsRefetch(searchParam)'/>

  <EventWidgetDetailDialog
    v-if='eventDetailDialogVisible'
    :dialog-visible='eventDetailDialogVisible'
    :item='event'
    @hide-dialog='hideEventDetailDialog'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import EventWidgetDetailDialog from '@/apps/widget/views/event/dialog/EventWidgetDetailDialog.vue';
import SaveEventWidgetDialog from '@/apps/widget/views/event/dialog/SaveEventWidgetDialog.vue';
import EventWidgetHeader from '@/apps/widget/views/event/EventWidgetHeader.vue';
import { deleteEventGraphql, getEventsGraphql } from '@/common/api/graphql/event-graphql';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';
import { convertAlias, mapEnum } from '@/common/helpers/utils';
import { type DisplayType, type Event, EventType } from '@/common/model/widget/event';

const { t } = useI18n();
const { moment } = useMoment();

const allEventType = mapEnum(EventType).join(',');
const eventType = ref(allEventType);
const rangeType = ref<'day' | 'week' | 'month'>('month');
const range = ref<[Date | null, Date | null]>([null, null]);
const viewerType = ref<'EventWidgetDatatable' | 'EventWidgetCalendar'>('EventWidgetDatatable');

const displayTypes: DisplayType[] = [
  {
    icon: 'list',
    value: 'list'
  },
  {
    icon: 'calendar_month',
    value: 'calendar'
  }
];

const displayType = ref<DisplayType>(displayTypes[0]);
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());

const allEvents = ref<Event[]>();
const event = ref<Event>({} as Event);
const d_searchName = ref('');
const d_searchUser = ref('');
const events = computed(() => allEvents.value
  ?.filter(event => convertAlias(event.name).includes(convertAlias(d_searchName.value)))
  .filter(event => !d_searchUser.value
        || (eventFilterByHost(event, d_searchUser.value) || eventFilterByParticipants(event, d_searchUser.value)))
  .map((event, i) => ({
    ...event,
    ordinalNumber: i + 1
  }))
);

const rangeFilter = computed(() => ({
  fromDate: range.value[0] ? moment(range.value[0]).format('YYYY-MM-DD') : moment().startOf(rangeType.value).format('YYYY-MM-DD'),
  toDate: range.value[1] ? moment(range.value[1]).format('YYYY-MM-DD') : moment().endOf(rangeType.value).format('YYYY-MM-DD')
}));

function updateEventType(type: string) {
  eventType.value = type;
}

function updateRangeType(range: 'day' | 'week' | 'month') {
  rangeType.value = range;
}

function updateRange(rangeDate: [Date | null, Date | null]) {
  range.value = rangeDate;
}

watch(() => displayType.value.value, (value) => {
  viewerType.value = value === 'list' ? 'EventWidgetDatatable' : 'EventWidgetCalendar';
});

function searchKeyword(searchName: string, searchUser: string) {
  d_searchName.value = searchName;
  d_searchUser.value = searchUser;
}

function eventFilterByHost(event: Event, keyword: string): boolean {
  if (event.host) {
    const user = usersMoreInfo.value[event.host];
    return filterByUser(user, keyword);
  }
  return false;
}

function eventFilterByParticipants(event: Event, keyword: string): boolean {
  if (event.participants) {
    return event.participants.some(id => {
      const user = usersMoreInfo.value[id];
      return filterByUser(user, keyword);
    });
  }
  return false;
}

function filterByUser(user: UserMoreInfo, keyword: string): boolean {
  const key = convertAlias(keyword);
  return convertAlias(user.fullName).includes(key) || convertAlias(user.email).includes(key);
}

const searchParam = computed(() => ({
  isDeleted: false,
  types: eventType.value.split(','),
  fromDate: rangeFilter.value.fromDate,
  toDate: rangeFilter.value.toDate,
  limit: null
}));

const {
  onResult: getEventsResult,
  refetch: getEventsRefetch
} = getEventsGraphql(searchParam.value);

getEventsResult((response) => {
  allEvents.value = get(response, 'data.events', []);
});

watch(() => searchParam.value, () => {
  getEventsRefetch(searchParam.value);
}, { deep: true });

const saveEventDialogVisible = ref(false);
const eventDetailDialogVisible = ref(false);

function showSaveEventDialog() {
  saveEventDialogVisible.value = true;
  event.value = {} as Event;
}

function showEventDetailDialog(item: Event) {
  eventDetailDialogVisible.value = true;
  event.value = item;
}

function showEditEventDialog(item: Event) {
  saveEventDialogVisible.value = true;
  event.value = item;
}

function hideEditEventDialog() {
  saveEventDialogVisible.value = false;
  event.value = {} as Event;
}

function hideEventDetailDialog() {
  eventDetailDialogVisible.value = false;
  event.value = {} as Event;
}

const {
  mutate: deleteEventMutate,
  onDone: deleteEventDone
} = deleteEventGraphql();
deleteEventDone(() => {
  toastSuccess({});
  getEventsRefetch(searchParam.value);
});

const confirm = useConfirm();

function deleteEvent(event: Event) {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('widget.event.objectName'),
      itemName: event.name
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteEventMutate({ eventId: event.id });
    }
  });
}

</script>

<script lang='ts'>

import EventWidgetCalendar from '@/apps/widget/views/event/EventWidgetCalendar.vue';
import EventWidgetDatatable from '@/apps/widget/views/event/EventWidgetDatatable.vue';

export default {
  name: 'EventWidget',

  components: {
    EventWidgetCalendar,
    EventWidgetDatatable
  }
};
</script>