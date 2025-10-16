<template>
  <div
    class='surface-0'
    style='height: 81vh'>
    <DataTable
      :scroll-height='scrollHeight'
      scrollable
      show-gridlines
      striped-rows
      :value='groupByRoom'>
      <Column
        body-class='font-semibold surface-ground'
        field='room'
        frozen
        :header="t('meeting.common.room')"
        header-style='min-width: 12.5rem'>
        <template #body='{ data: { id, room, meeting } }'>
          <div class='align-items-center flex flex-column gap-2'>
            <div
              class='cursor-pointer'
              @click='showDialogMtR(id)'>
              {{ room }}
            </div>
            <Avatar
              :label='countMeeting(meeting).toString()'
              shape='circle'/>
          </div>
        </template>
      </Column>
      <Column
        v-for='date in datesToShow'
        :key='date.toISOString()'
        :header-class='flattenClassName(getClassForDay(date))'
        header-style='min-width: 12.5rem'
        :pt="{
          bodyCell: {
            class: 'p-0 ' + flattenClassName(getBgClassForDay(date)),
          },
        }">
        <template #header>
          <div class='align-items-center flex flex-column'>
            <div>{{ upperFirst(formatDay(date)) }}</div>
            <div>{{ moment(date).format('DD/MM') }}</div>
          </div>
        </template>
        <template #body='{ data }'>
          <div
            v-for="meeting in data.meeting[moment(date).format('YYYY-MM-DD')]"
            :key='meeting.id'
            class='align-items-center flex gap-2 hover:bg-black-alpha-20 p-2'
            :class='getClassForMeeting(meeting)'>
            <AppUser
              v-if='meeting.hostId'
              avatar-size='2.5'
              is-highlight
              overlay-visible
              :user-id='meeting.hostId'/>
            <div class='flex flex-column gap-1'>
              <div
                class='cursor-pointer'
                @click='showMeetingDetail(meeting.id)'>{{ meeting.content }}
              </div>
              <div class='align-items-center flex gap-1'>
                <AppIcon
                  v-if='meeting.isImportant'
                  class='text-yellow-500'
                  fill
                  name='star'/>
                {{ moment(meeting.startTime).format('HH:mm') }} -
                {{ moment(meeting.endTime).format('HH:mm') }}
              </div>
              <template
                v-if='
                  meeting.meetingType &&
                    meeting.meetingType !== MeetingType.OFFLINE
                '>
                <a
                  v-if='meeting.onlineUrl'
                  target='_blank'>
                  <AppIcon
                    class='text-blue-600'
                    fill
                    name='videocam'/>
                </a>
                <AppIcon
                  v-else
                  fill
                  name='videocam'/>
              </template>
            </div>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <MeetingRoomForm
    v-if='showInfoMeetingRoom'
    :id='idMeetingRoom'
    :is-detail='true'
    :visible-dialog='showInfoMeetingRoom'
    @hide-dialog='hideDialogMtR'/>
  <MeetingDetail
    v-if='visibleDetail'
    :id='meetingId'
    :header="
      (display == 'week'
        ? t('meeting.meeting.meetingWeek')
        : t('meeting.meeting.meetingMonth')) +
        ': ' +
        t('meeting.meeting.detailInfo')
    "
    :visible-detail='visibleDetail'
    @hide-dialog='visibleDetail = false'/>
</template>

<script lang='ts' setup>
import { upperFirst } from 'lodash';
import { computed, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { type MeetingInterface, MeetingType, } from '@/apps/meeting/model/meeting';
import { getDatesInMonth, getDatesInWeek, } from '@/apps/meeting/views/meeting/components/meeting-calendar';
import {
  flattenClassName,
  getBgClassForDay,
  getClassForDay,
  getClassForMeeting,
} from '@/apps/meeting/views/meeting/components/meeting-class';
import MeetingDetail from '@/apps/meeting/views/meeting/components/MeetingDetail.vue';
import MeetingRoomForm from '@/apps/meeting/views/meeting/components/room/MeetingRoomForm.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import { formatDay } from '@/common/helpers/time-util';

const props = defineProps({
  model: {
    type: Array as PropType<MeetingInterface[]>,
    default: () => [],
  },
  display: {
    type: String as PropType<'week' | 'month'>,
    default: 'week',
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  month: {
    type: Number,
    validator: function (value: number, props) {
      return props.display === 'month' ? value >= 0 && value <= 11 : true;
    },
    default: new Date().getMonth(),
  },
  week: {
    type: Number,
    validator: function (value: number, props) {
      return props.display === 'week' ? value >= 0 && value <= 52 : true;
    },
    default: 0,
  },
});
const meetingId = ref<string>('');
const visibleDetail = ref(false);
const { moment } = useMoment();
const { t } = useI18n();

type MeetingByDate = Record<string, MeetingInterface[]>;
type MeetingByRoom = Record<
  string,
  { id: string; room: string; meeting: MeetingByDate }
>;

const showInfoMeetingRoom = ref();
const idMeetingRoom = ref();

function showDialogMtR(id: string) {
  idMeetingRoom.value = id;
  showInfoMeetingRoom.value = true;
}

function hideDialogMtR() {
  showInfoMeetingRoom.value = false;
}

const showMeetingDetail = (id: string) => {
  meetingId.value = id;
  visibleDetail.value = true;
};

const groupByRoom = computed(() => {
  return Object.values(
    props.model.reduce((acc, meeting) => {
      const roomId = meeting.meetingRoom.id;
      const startDate = moment(meeting.startTime).format('YYYY-MM-DD');

      if (!acc[roomId]) {
        acc[roomId] = {
          id: meeting.meetingRoom.id,
          room: meeting.meetingRoom.name,
          meeting: {},
        };
      }

      if (!acc[roomId].meeting[startDate]) {
        acc[roomId].meeting[startDate] = [];
      }

      acc[roomId].meeting[startDate].push(meeting);
      acc[roomId].meeting[startDate].sort(
        (a, b) =>
          new Date(a.startTime).valueOf() - new Date(b.startTime).valueOf(),
      );
      return acc;
    }, {} as MeetingByRoom),
  );
});
const datesInWeek = computed(() => getDatesInWeek(props.year, props.week));

const datesInMonth = computed(() => getDatesInMonth(props.year, props.month));

const datesToShow = computed(() =>
  props.display === 'week' ? datesInWeek.value : datesInMonth.value,
);

const scrollHeight = ref(calculateHeight());
window.onresize = () => scrollHeight.value = calculateHeight();

function scrollToday() {
  setTimeout(() => {
    const todayColumn = document.querySelector('.today');
    todayColumn?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'center',
    });
  }, 10);
}

function calculateHeight() {
  const height = window.innerHeight - 180;
  return `${height}px`;
}

function countMeeting(m: MeetingByDate | undefined) {
  if (!m) {
    return 0;
  }
  return Object.values(m).reduce((acc, value) => acc + value.length, 0);
}

watch(
  () => props.display,
  () => {
    scrollToday();
  },
);

onMounted(() => {
  scrollToday();
});
</script>

<style scoped>
:deep(.saturdayBgc) {
  background-color: #FEFBEF !important;
  color: #DE911D !important;
}

:deep(.sundayBgc) {
  background-color: #FFF5F5 !important;
  color: #FF8B4E !important;
}

.text-green {
  color: #22C55E
}

.text-blue {
  color: #0D96FA
}

.text-red {
  color: #FF4406
}
</style>
