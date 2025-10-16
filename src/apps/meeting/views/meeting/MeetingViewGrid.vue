<template>
  <div
    class='overflow-auto'
    style='max-height: 75vh'>
    <InfoMeetingInDay
      v-for='(meeting, index) in listMeeting'
      :key='index'
      :meetings-in-day='meeting'/>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment/moment';
import { computed, type PropType } from 'vue';

import type { MeetingInterface, MeetingsMap } from '@/apps/meeting/model/meeting';
import InfoMeetingInDay from '@/apps/meeting/views/meeting/components/InfoMeetingInDay.vue';
import { DateTimeFormat } from '@/common/constants';

const props = defineProps({
  listDateProp: {
    type: Array as PropType<Date[]>,
    default: () => []
  },
  listMeetingProp: {
    type: Array as PropType<MeetingInterface[]>,
    default: () => []
  },
});

const listMeeting = computed((): MeetingsMap => {
  let m1 = props.listMeetingProp
    .filter(m => props.listDateProp.map(d => moment(d).format(DateTimeFormat.ISO_LOCAL_DATE))
      .includes(moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE)))
    .map(m => ({
      ...m,
      key: moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE)
    }));
  const m2 = props.listDateProp.filter(d => !m1.find(m => m.key === moment(d).format(DateTimeFormat.ISO_LOCAL_DATE)))
    .map(d => ({ key: moment(d).format(DateTimeFormat.ISO_LOCAL_DATE) } as MeetingInterface));
  let rs = [...m1, ...m2];
  rs.sort((a, b) => new Date(a.key || '').getTime() - new Date(b.key || '').getTime());
  return mergeMeetingsByKey(rs);
});

function mergeMeetingsByKey(meetings: MeetingInterface[]): MeetingsMap {
  const mergedMeetings = {} as MeetingsMap;

  meetings.forEach(meeting => {
    const key = meeting.key;
    if (!mergedMeetings[key]) {
      mergedMeetings[key] = [];
    }
    mergedMeetings[key].push(meeting);
  });

  return mergedMeetings;
}
</script>

<style scoped>

</style>