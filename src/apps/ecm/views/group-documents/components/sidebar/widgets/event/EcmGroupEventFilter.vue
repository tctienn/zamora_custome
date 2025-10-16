<template>
  <div class='flex flex-row flex-wrap gap-2'>
    <div class='flex flex-row flex-wrap gap-2 justify-content-between w-full'>
      <div class='align-items-center flex flex-row'>
        <div
          v-for='(range, index) in dateRanges'
          :key='range.key'
          class='flex'>
          <Divider
            v-if='index > 0'
            class='mx-2 p-0'
            layout='vertical'/>
          <span
            class='cursor-pointer hover:text-primary'
            :class='{"font-bold text-primary": activeDateRange === index}'
            @click='changeDateRange(range.key, index)'>{{ t(range.label) }}</span>
        </div>
      </div>

      <!--      <Calendar-->
      <!--        v-model='dateFilter'-->
      <!--        input-class='text-sm'-->
      <!--        :manual-input='true'-->
      <!--        selection-mode='range'-->
      <!--        @hide='changeRange'/>-->
    </div>

    <div
      v-if='filterTypeVisible'
      class='flex flex-row flex-wrap'>
      <div
        v-for='(type, index) in eventTypes'
        :key='index'
        class='flex'>
        <Divider
          v-if='index > 0'
          class='mx-2 p-0'
          layout='vertical'/>
        <span
          class='cursor-pointer font-italic hover:text-primary'
          :class='{"font-bold text-primary": activeType === index}'
          @click='changeEventType(type.types, index)'>{{ t(type.label) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EventBus from '@/common/helpers/event-bus';
import useMoment from '@/common/helpers/mixins/use-moment';
import { EventType } from '@/common/model/widget/event';

defineProps({
  filterTypeVisible: {
    type: Boolean,
    default: true
  }
});

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

const eventTypes = ref<{ types: string[], label: string }[]>([
  {
    types: [EventType[EventType.GROUP]],
    label: 'ecm.group.eventWidget.groupEvent',
  },
  {
    types: [EventType[EventType.ORGANIZATION]],
    label: 'ecm.group.eventWidget.organizationEvent',
  },
  {
    types: [EventType[EventType.SYSTEM]],
    label: 'ecm.group.eventWidget.systemEvent',
  },
  {
    types: [EventType[EventType.GROUP], EventType[EventType.ORGANIZATION], EventType[EventType.SYSTEM]],
    label: 'common.all',
  }
]);

const dateFilter = ref([moment().startOf('week').toDate(), moment().endOf('week').toDate()]);
const typeFilter = ref([EventType[EventType.GROUP]]);
const activeDateRange = ref(1);
const activeType = ref(0);

// function changeRange() {
//   EventBus.emit('ecm-group-filter-event', {
//     dates: dateFilter.value,
//     types: typeFilter.value
//   });
// }

function changeDateRange(key: 'day' | 'week' | 'month', index: number) {
  dateFilter.value = [moment().startOf(key).toDate(), moment().endOf(key).toDate()];
  activeDateRange.value = index;

  EventBus.emit('ecm-group-filter-event', {
    dates: dateFilter.value,
    types: typeFilter.value
  });
}

function changeEventType(types: string[], index: number) {
  typeFilter.value = types;
  activeType.value = index;

  EventBus.emit('ecm-group-filter-event', {
    dates: dateFilter.value,
    types: typeFilter.value
  });
}

</script>

<script lang='ts'>
export default { name: 'EcmGroupEventFilter' };
</script>