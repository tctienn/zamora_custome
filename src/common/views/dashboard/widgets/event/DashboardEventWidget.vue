<template>
  <SystemDashboardWidget :widget='widget'>

    <template #body>
      <DashboardEventFilter @filter-event='filterEvent'/>

      <div class='flex flex-column row-gap-2'>
        <DashboardEventItem
          v-for='day in Object.keys(groupedEvents)'
          :key='day'
          :day='day'
          :events='groupedEvents[day]' />
      </div>
    </template>

    <template #footer>
      <router-link
        class='align-self-end font-italic mx-3 my-1 text-color underline'
        :to='{name: "WidgetEvent"}'>
        <small>{{ `${toLower(t("common.viewMore"))}` }}</small>
      </router-link>
    </template>

  </SystemDashboardWidget>
</template>

<script setup lang='ts'>
import { get, groupBy, toLower } from 'lodash';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getEventsGraphql } from '@/common/api/graphql/event-graphql';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { WidgetInstance } from '@/common/model';
import { type Event, EventType } from '@/common/model/widget/event';
import SystemDashboardWidget from '@/common/views/dashboard/component/SystemDashboardWidget.vue';
import DashboardEventFilter from '@/common/views/dashboard/widgets/event/DashboardEventFilter.vue';
import DashboardEventItem from '@/common/views/dashboard/widgets/event/DashboardEventItem.vue';

const props = defineProps({
  widget: {
    type: Object as PropType<WidgetInstance>,
    default: {} as WidgetInstance
  }
});
const { moment } = useMoment();
const { t } = useI18n();

const events = ref<Event[]>([]);
const types = ref<string[]>([EventType[EventType.PERSONAL]]);
const fromDate = ref(moment().startOf('week').format('YYYY-MM-DD'));
const toDate = ref(moment().endOf('week').format('YYYY-MM-DD'));

const searchParam = computed(() => ({
  isDeleted: false,
  types: types.value,
  fromDate: fromDate.value,
  toDate: toDate.value,
  limit: props.widget?.recordNumber ?? 3
}));

const groupedEvents = computed(() => groupBy(events.value, 'date'));

const { onResult: getEventsResult, refetch: getEventsRefetch } = getEventsGraphql(searchParam.value);

getEventsResult((response) => {
  events.value = get(response, 'data.events', []);
});

function filterEvent({ dates, eventTypes }: { dates: string[], eventTypes: string[] }) {
  fromDate.value = dates[0] ?? null;
  toDate.value = dates[1] ?? null;
  types.value = eventTypes;

  getEventsRefetch(searchParam.value);
}

</script>

<script lang='ts'>
export default { name: 'DashboardEventWidget' };
</script>