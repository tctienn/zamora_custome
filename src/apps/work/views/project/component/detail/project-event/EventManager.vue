<template>
  <div class='align-items-center flex justify-content-between m-2'>
    <div class='font-bold text-xl'>Danh sách sự kiện</div>
    <Menubar :model='menuLeft' />
  </div>

  <Splitter class='mb-5'>
    <SplitterPanel>
      <div
        class='p-3'
        style='min-height: 85vh'>
        <div class='align-items-center flex gap-2 justify-content-between'>
          <div class='align-items-center flex gap-2'>
            <AppIcon
              name='calendar_clock'
              size='1.5' />
            <div class='font-bold text-xl'>Lịch và sự kiện</div>
          </div>
          <MeetingSelect
            v-model:week='week'
            v-model:year='year' />
        </div>
        <div
          v-for='(item, i) in meetings'
          :key='i'>
          <ProjectMeetingInfoInDay :data='item' />
        </div>
      </div>
    </SplitterPanel>
    <SplitterPanel>
      <div></div>
    </SplitterPanel>
  </Splitter>

  <MeetingForm
    v-if='visibleForm'
    :project-id='props.projectId'
    :visible-form='visibleForm'
    @hide-dialog='hideDialog'/>
</template>

<script setup lang="ts">
import { clone } from 'lodash';
import moment from 'moment/moment';
import { computed, onMounted, ref, watch } from 'vue';

import { findAllByProjectIdAndIsDeletedFalse } from '@/apps/meeting/graphql/meeting';
import type {
  MeetingInterface,
  MeetingsMap,
} from '@/apps/meeting/model/meeting';
import {
  currentWeekNumber,
  getDatesInWeek,
} from '@/apps/meeting/views/meeting/components/meeting-calendar';
import MeetingSelect from '@/apps/meeting/views/meeting/components/MeetingSelect.vue';
import MeetingForm from '@/apps/work/views/project/component/detail/project-event/meeting/MeetingForm.vue';
import ProjectMeetingInfoInDay from '@/apps/work/views/project/component/detail/project-event/meeting/ProjectMeetingInfoInDay.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat } from '@/common/constants';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});
const listMeeting = ref<MeetingInterface[]>([]);
const today = new Date();
const year = ref(today.getFullYear());
const week = ref(currentWeekNumber());
const dateBetween = ref<Date[]>([]);
const startDate = ref<Date>();
const endDate = ref<Date>();
const {
  onResult: getResult,
  variables: getVariable,
  refetch: getRefetch,
} = findAllByProjectIdAndIsDeletedFalse();

getResult((res) => {
  listMeeting.value = res.data.findAllByProjectIdAndIsDeletedFalse;
});
const visibleForm = ref(false);

function getMeeting() {
  getVariable.value = {
    startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
    endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
    projectId: props.projectId,
  };
}

function hideDialog() {
  visibleForm.value = false;
  getRefetch();
}

const meetings = computed((): MeetingsMap => {
  let m1 = listMeeting.value
    .filter((m) =>
      dateBetween.value
        .map((d) => moment(d).format(DateTimeFormat.ISO_LOCAL_DATE))
        .includes(moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE)),
    )
    .map((m) => ({
      ...m,
      key: moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE),
    }));
  const m2 = dateBetween.value
    .filter(
      (d) =>
        !m1.find(
          (m) => m.key === moment(d).format(DateTimeFormat.ISO_LOCAL_DATE),
        ),
    )
    .map(
      (d) =>
        ({ key: moment(d).format(DateTimeFormat.ISO_LOCAL_DATE), }) as MeetingInterface,
    );
  let rs = [...m1, ...m2];
  rs.sort(
    (a, b) => new Date(a.key || '').getTime() - new Date(b.key || '').getTime(),
  );
  return mergeMeetingsByKey(rs);
});

function mergeMeetingsByKey(meetings: MeetingInterface[]): MeetingsMap {
  const mergedMeetings = {} as MeetingsMap;

  meetings.forEach((meeting) => {
    const key = meeting.key;
    if (!mergedMeetings[key]) {
      mergedMeetings[key] = [];
    }
    mergedMeetings[key].push(meeting);
  });

  return mergedMeetings;
}

function setFromAndToDate() {
  const dates = getDatesInWeek(year.value, week.value);
  dateBetween.value = clone(dates);
  startDate.value = dates.shift();
  endDate.value = dates.pop();
  getMeeting();
}

onMounted(() => {
  setFromAndToDate();
});

watch(year, () => {
  setFromAndToDate();
});

watch(week, () => {
  setFromAndToDate();
});

const menuLeft = computed(() => [
  {
    label: 'Thêm mới',
    icon: 'pi pi-plus',
    command: () => {
      visibleForm.value = true;
    },
  },
]);
</script>

<style scoped>
:deep(.p-menubar) {
  padding: 0 !important;
}
</style>
