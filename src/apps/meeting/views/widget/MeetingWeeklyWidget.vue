<template>
  <div class='border-round card'>
    <div class='align-items-center flex justify-content-between'>
      <div class='font-bold text-primary text-xl'>
        {{ t('meeting.meeting.meetingWeekly') }}
      </div>
      <div> {{ weeksInYear }}</div>
    </div>

    <div
      class='border-bottom-1 surface-border'
      style='margin: 0.5rem -0.5rem'></div>

    <div class='h-20rem mt-3 overflow-auto'>
      <div
        v-for='(meeting, index) in listMeetingInfo'
        :key='index'>
        <div
          v-if='meeting[0]?.content'
          class='border-300 border-top-1 grid grid-nogutter pt-2'>
          <div class='col-3 mb-2'>
            <div class='font-bold'>
              {{
                upperFirst(moment(meeting[0]?.key).format('dddd'))
              }}
            </div>
            <div class='font-normal mt-1'>
              Ngày {{ upperFirst(moment(meeting[0].key).format('DD/MM')) }}
            </div>
          </div>
          <div class='col-9'>
            <div class=''>
              <MeetingInfoWidget
                v-for='(mt, idx) in meeting'
                :key='idx'
                class='mb-2'
                :meeting='mt'/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { upperFirst } from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { listMeetingByStartEnd } from '@/apps/meeting/graphql/meeting';
import type { MeetingInterface, MeetingsMap, } from '@/apps/meeting/model/meeting';
import MeetingInfoWidget from '@/apps/meeting/views/widget/components/MeetingInfoWidget.vue';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n();
const { moment } = useMoment();
const {
  onResult: getResult,
  variables: getVariable
} = listMeetingByStartEnd();

const dateBetween = ref<Date[]>([]);
const listMeeting = ref<MeetingInterface[]>([]);
const startDate = ref<Date>();
const endDate = ref<Date>();

const weeksInYear = computed(() => {
  const now = moment();
  const currentWeek = now.week();
  const startOfWeek = moment().startOf('week').format('DD/MM/YYYY');
  const endOfWeek = moment().endOf('week').format('DD/MM/YYYY');

  return t('common.week') + ' ' + currentWeek + ' (' + startOfWeek + ' - ' + endOfWeek + ')';
});

function setFromAndToDate() {
  const startDateValue = moment().startOf('week').toDate();
  const endDateValue = moment().endOf('week').toDate();

  const dateBetweenValue = [];
  let tempDate = new Date(startDateValue);

  while (tempDate <= endDateValue) {
    dateBetweenValue.push(new Date(tempDate));
    tempDate.setDate(tempDate.getDate() + 1);
  }

  startDate.value = startDateValue;
  endDate.value = endDateValue;
  dateBetween.value = dateBetweenValue;

  getMeeting();
}

onMounted(() => {
  setFromAndToDate();
});

getResult((res) => {
  listMeeting.value = res.data.listMeetingByStartEnd;
});

function getMeeting() {
  getVariable.value = {
    userIds: [],
    startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
    endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
    isConfig: false,
  };
}

const listMeetingInfo = computed((): MeetingsMap => {
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

const isToday = (date?: string): boolean => {
  return moment(date).isSame(moment(), 'day');
};
</script>

<style scoped></style>
