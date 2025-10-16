<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2 h-3rem'>
        <div class='font-bold'>
          Danh sách phòng họp
        </div>
      </div>
    </template>

  </Toolbar>
  <div class='flex flex-column gap-2'>
    <MeetingTopDisplayPanel
      v-model:display='display'
      v-model:month='month'
      v-model:week='week'
      v-model:year='year'
      class='border-1 border-300 border-round-sm p-1 surface-0'/>

    <MeetingRoomView
      :display='display'
      :model='model'
      :month='month'
      :week='week'
      :year='year'/>
  </div>

</template>

<script lang='ts' setup>

import { computed, ref, watch } from 'vue';

import { meetings } from '@/apps/meeting/graphql/meeting';
import { currentWeekNumber, getDatesInWeek } from '@/apps/meeting/views/meeting/components/meeting-calendar';
import MeetingTopDisplayPanel from '@/apps/meeting/views/meeting/components/MeetingTopDisplayPanel.vue';
import MeetingRoomView from '@/apps/meeting/views/meeting/components/room/MeetingRoomView.vue';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const { moment } = useMoment();
const display = ref<'week' | 'month'>('week');

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());
const week = ref(currentWeekNumber());

const startDate = computed(() => {
  return display.value === 'week' ? getDatesInWeek(year.value, week.value)[0] : new Date(year.value, month.value, 1);
});

const endDate = computed(() => {
  return display.value === 'week' ? getDatesInWeek(year.value, week.value)[6] : new Date(year.value, month.value + 1, 0);
});

const {
  variables,
  result
} = meetings({
  startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
  endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE)
});
const model = computed(() => result.value?.listMeetingByStartEnd);

watch([year, month, week, display], () => {
  variables.value = {
    searchModel: {
      startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
      endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE)
    }
  };
});
</script>

<style scoped>

</style>