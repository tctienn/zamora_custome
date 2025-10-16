<template>
  <div class='flex flex-row flex-wrap gap-2'>
    <div class='flex flex-row flex-wrap gap-2 justify-content-between w-full'>
      <div class='align-items-center flex flex-row'>
        <div
          v-for='(range, index) in dateRanges'
          :key='range.key'
          class='flex'>
          <span
            class='cursor-pointer hover:text-primary'
            :class='{"font-bold text-primary": activeDateRange === index}'
            @click='changeDateRange(range.key, index)'>{{ t(range.label) }}</span>
          <Divider
            v-if='index < dateRanges.length - 1'
            class='border-400 border-left-1 mx-3 p-0'
            layout='vertical'/>

        </div>
      </div>
    </div>

    <div
      class='flex flex-row flex-wrap'>
      <div
        v-for='(type, index) in eventTypes'
        :key='index'
        class='flex'>
        <span
          class='cursor-pointer font-italic hover:text-primary'
          :class='{"font-bold text-primary": activeType === index}'
          @click='changeEventType(type.types, index)'>{{ t(type.label) }} ({{ type.count }})</span>
        <Divider
          v-if='index < eventTypes.length - 1'
          class='border-400 border-left-1 mx-2 p-0'
          layout='vertical'/>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { cloneDeep, find, findIndex, forEach, get, sumBy } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { countEventsGraphql } from '@/common/api/graphql/event-graphql';
import useMoment from '@/common/helpers/mixins/use-moment';
import { mapEnum } from '@/common/helpers/utils';
import { EventType } from '@/common/model/widget/event';

const emits = defineEmits(['filter-event']);

const { moment } = useMoment();

const { t } = useI18n();

const dateRanges = ref<{ key: 'day' | 'week' | 'month', label: string }[]>([
  {
    key: 'day',
    label: 'ecm.group.eventWidget.today',
  },
  {
    key: 'week',
    label: 'ecm.group.eventWidget.thisWeek',
  },
  {
    key: 'month',
    label: 'ecm.group.eventWidget.thisMonth',
  }
]);

const eventTypes = ref<{ types: string[], label: string, count: number }[]>([
  {
    types: [EventType[EventType.PERSONAL]],
    label: 'common.personal',
    count: 0
  },
  {
    types: [EventType[EventType.GROUP]],
    label: 'common.group',
    count: 0
  },
  {
    types: [EventType[EventType.ORGANIZATION]],
    label: 'common.organization',
    count: 0
  },
  {
    types: [EventType[EventType.SYSTEM]],
    label: 'common.system',
    count: 0
  },
  {
    types: [EventType[EventType.PERSONAL], EventType[EventType.GROUP], EventType[EventType.ORGANIZATION], EventType[EventType.SYSTEM]],
    label: 'common.all',
    count: 0
  }
]);

const dateFilter = ref([moment().startOf('week').format('YYYY-MM-DD'), moment().endOf('week').format('YYYY-MM-DD')]);
const typeFilter = ref([EventType[EventType.PERSONAL]]);
const activeDateRange = ref(1);
const activeType = ref(0);

const searchParam = computed(() => ({
  isDeleted: false,
  types: mapEnum(EventType),
  fromDate: dateFilter.value[0],
  toDate: dateFilter.value[1]
}));

const {
  onResult: countEventsResult,
  refetch: countEventRefetch
} = countEventsGraphql(searchParam.value);

countEventsResult((response) => {
  const countEvents = get(response, 'data.countEvents', [{
    type: '',
    count: 0
  }]);
  const totalNotes = sumBy(countEvents, 'count');
  const clonedEventTypes = cloneDeep(eventTypes.value);
  forEach(clonedEventTypes, (type, index) => {
    const countType = find(countEvents, ['type', type.types[0]]);
    if (countType) {
      clonedEventTypes[index].count = countType.count;
    } else {
      clonedEventTypes[index].count = 0;
    }
  });

  const subHeaderAllIndex = findIndex(clonedEventTypes, (type) => type.types.length === eventTypes.value.length - 1);
  if (subHeaderAllIndex >= 0) {
    clonedEventTypes[subHeaderAllIndex].count = totalNotes;
  }

  eventTypes.value = clonedEventTypes;
});

function changeDateRange(key: 'day' | 'week' | 'month', index: number) {
  dateFilter.value = [moment().startOf(key).format('YYYY-MM-DD'), moment().endOf(key).format('YYYY-MM-DD')];
  activeDateRange.value = index;

  emits('filter-event', {
    dates: dateFilter.value,
    eventTypes: typeFilter.value
  });

  countEventRefetch(searchParam.value);
}

function changeEventType(types: string[], index: number) {
  typeFilter.value = types;
  activeType.value = index;

  emits('filter-event', {
    dates: dateFilter.value,
    eventTypes: typeFilter.value
  });
}

</script>

<script lang='ts'>
export default { name: 'DashboardEventFilter' };
</script>