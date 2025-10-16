<template>
  <div class='scroll-wrapper'>
    <div class='scroll-content'>
      <div
        v-for='(meetings, date) in groupedMeetings'
        :key='date'
        class='items-start p-4 space-x-4 w-full'>
        <div class='flex'>
          <div class='border-r w-6rem'>
            <p class='font-semibold my-0 text-sm'>{{ getDayLabel(date.toString()) }}</p>
            <p class='text-gray-600 text-xs'>
              Ngày {{ moment(date).format('DD/MM') }}
            </p>
          </div>

          <div class='w-full'>
            <div
              v-for='meeting in meetings'
              :key='meeting.id'
              class='cursor-pointer duration-200 flex flex-column hover:bg-gray-100 p-2 rounded-lg transition-colors w-full'
              @click='goToMeeting'>
              <div class='flex items-start w-full'>
                <div
                  class='mr-2'
                  :style="{ width: '2px', borderRadius: '2px', background: getMeetingColor(meeting) }"></div>

                <div class='flex flex-column pb-2 w-full'>
                  <div class='font-semibold'>
                    {{ meeting.content }}
                  </div>

                  <div class='flex justify-content-between w-full'>
                    <div>
                      <div class='flex items-center mt-1 text-gray-600 text-sm'>
                        <i class='mr-1 pi pi-clock text-gray-500'></i>
                        <span>
                          {{
                            meeting.startTime
                              ? moment(meeting.startTime).format('HH:mm')
                              : ''
                          }}
                          {{
                            meeting.endTime
                              ? ` - ${moment(meeting.endTime).format('HH:mm')}`
                              : ''
                          }}
                        </span>
                      </div>

                      <div class='flex items-center mt-1 text-gray-600 text-sm'>
                        <i class='mr-1 pi pi-map-marker text-gray-500'></i>
                        <span>{{ meeting?.meetingRoom?.name }}</span>
                      </div>
                    </div>

                    <div class='pl-8'>
                      <AppGroupAvatar
                        avatar-size='2.5'
                        :number-avatar-display='4'
                        :user-ids='[meeting.hostId, ...meeting?.attendees.map((a: any) => a.userId)]'
                        :users-highlight='meeting.hostId'/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import moment from 'moment/moment';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { getAllUserPublicServiceFullField } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { listMeetingByStartEndForWidget } from '@/apps/meeting/graphql/meeting';
import { currentWeekNumber, getDatesInWeek, } from '@/apps/meeting/views/meeting/components/meeting-calendar';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';

const users = ref([]);
const listMeeting = ref();
const router = useRouter();
const today = new Date();
const year = ref(today.getFullYear());
const week = ref(currentWeekNumber());
const dates = getDatesInWeek(year.value, week.value);
const { t } = useI18n();

const {
  load: listMeetingLoad,
  onResult: getResult
} =
  listMeetingByStartEndForWidget();

getResult((res) => {
  listMeeting.value = res.data.listMeetingByStartEnd;
  groupedMeetings.value = groupMeetingsByDate(listMeeting.value);
});

listMeetingLoad(undefined, {
  searchModel: {
    startDate: moment(dates[0]).format('YYYY-MM-DD'),
    endDate: moment(dates[dates.length - 1]).format('YYYY-MM-DD'),
    isConfig: false,
  }
});

getAllUserPublicServiceFullField().onResult((res) => {
  users.value = res.data.getAllUserPublicServiceFullField.map(
    (user: any) => user.id
  );
});

const userIds = computed(() =>
  [...users.value].sort(() => Math.random() - 0.5).slice(0, 2)
);

type Meeting = {
  id: string;
  content: string;
  startTime: string;
  endTime?: string;
  [key: string]: any;
};

function groupMeetingsByDate(
  meetings: Meeting[]
): Record<string, Meeting[]> {
  return meetings.reduce(
    (acc: Record<string, Meeting[]>, meeting: Meeting) => {
      const dateKey = meeting.startTime.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(meeting);
      return acc;
    },
    {}
  );
}

const groupedMeetings = ref();

function getMeetingColor(meeting: Meeting): string {
  const now = moment();
  const start = moment(meeting.startTime);
  const end = meeting.endTime ? moment(meeting.endTime) : null;

  // Nếu đã kết thúc
  if (end && end.isBefore(now)) {
    return '#6DD230'; // Đã qua
  }

  // Nếu trong hôm nay
  if (start.isSame(now, 'day')) {
    return '#F59E0B'; // Hôm nay (đang/sắp diễn ra)
  }

  // Còn lại là tương lai (khác ngày hôm nay)
  if (start.isAfter(now)) {
    return '#000000'; // Tương lai xa
  }

  // Trường hợp còn lại (không có endTime nhưng đã qua)
  if (start.isBefore(now)) {
    return '#6DD230'; // Đã qua
  }

  return '#000000'; // Mặc định phòng lỗi
}

function goToMeeting() {
  router.push({ path: '/meeting/calendar' });
}

function getDayLabel(date: string | Date): string {
  const diff = moment(date).startOf('day').diff(moment().startOf('day'), 'days');
  const labels = [
    t('media.common.dayLabels.yesterday'),
    t('media.common.dayLabels.today'),
    t('media.common.dayLabels.tomorrow'),
    t('media.common.dayLabels.dayAfterTomorrow')
  ];
  return labels[diff + 1] || '';
}
</script>

<style scoped>
.scroll-wrapper {
  height: 30rem;
  overflow: hidden;
}

.scroll-wrapper:hover .scroll-content {
  overflow-y: auto;
}

.scroll-content {
  height: 100%;
  overflow-y: overlay;
}
</style>