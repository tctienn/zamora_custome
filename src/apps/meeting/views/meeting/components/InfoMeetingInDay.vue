<template>
  <div class='grid m-0'>
    <div
      class='border-400 border-top-1 flex flex-column gap-2 p-3 text-center'
      :class="getBgClassForDay(new Date(meetingsInDay[0]?.key || ''))"
      style='width: 9%'>
      <div class='mb-0'>
        <div class='font-semibold text-xl'>
          {{ upperFirst(moment(meetingsInDay[0]?.key).format('dddd')) }}
        </div>
      </div>
      {{ upperFirst(moment(meetingsInDay[0].key).format('DD/MM/YYYY')) }}
    </div>
    <div
      class='col m-0 p-0 surface-50'
      :class="!meetingsInDay[0]?.hostId ? 'border-400 border-top-1' : ''">
      <div v-if='meetingsInDay[0]?.hostId'>
        <div
          v-for='(mtInfo, index) of meetingsInDay'
          :key='index'
          class='border-400 border-top-1 grid m-0 px-0 py-2'>
          <div
            class='align-items-center col-2 flex flex-column gap-2 text-center'>
            <h4
              class='mb-0'
              :class='getClassForMeeting(mtInfo)'>
              {{ moment(mtInfo?.startTime).format('HH:mm') }}
            </h4>
            <AppUser
              avatar-size='2.5'
              :user-id='mtInfo?.hostId'/>
            <div
              v-if='
                mtInfo?.meetingType &&
                  mtInfo?.meetingType !== MeetingType.OFFLINE
              '
              class='cursor-pointer'>
              <AppIcon
                fill
                name='videocam'
                size='1.5'
                style='color: #0d99ff'
                text/>
            </div>
            <div
              v-if='mtInfo?.isImportant'
              class='cursor-pointer'>
              <AppIcon
                v-tooltip.top="t('meeting.meeting.tooltip.importantMeeting')"
                fill
                name='star'
                size='1.5'
                style='color: #f4b400'
                text/>
            </div>
            <div
              v-if='mtInfo?.isConflict'
              class='cursor-pointer'
              @click='handleShowMeetingConflictDialog(mtInfo?.id)'>
              <AppIcon
                v-tooltip.top="
                  t('meeting.calendar.clickToSeeDuplicateCalendar')
                "
                name='report_problem'
                size='1.5'
                style='color: #f36f24'
                text/>
            </div>
          </div>
          <div class='col-10 flex flex-column gap-2 p-0'>
            <div class='flex'>
              <div class='align-items-center detail-label flex'>
                {{ t('meeting.calendar.table.content') }}
              </div>
              <div
                class='align-items-center cursor-pointer flex font-bold hover:text-primary-600'
                :class='getClassForMeeting(mtInfo)'
                @click='showDetail(mtInfo?.id)'>
                {{ mtInfo?.content }}
              </div>
            </div>
            <div class='align-items-center flex'>
              <div class='align-items-center detail-label flex'>
                {{ t('meeting.calendar.table.host') }}
              </div>
              <AppUser
                avatar-size='2.5'
                name-visible
                :user-id='mtInfo?.hostId'>
                <template #name='{ user }'>
                  <div class='ml-3'>
                    {{ t(getGender(user?.gender) || '') }}
                    <span class='font-bold'>{{ user?.fullName }}</span>
                    <span v-if='user?.positionName'>({{ user?.positionName }})</span>
                  </div>
                </template>
              </AppUser>
            </div>
            <div class='align-items-center flex'>
              <div class='align-items-center detail-label flex'>
                {{ t('meeting.calendar.table.element') }}
              </div>
              <div class='align-items-center flex font-bold mr-3'>
                Các đồng chí:
              </div>
              <AppGroupAvatar
                avatar-size='2.5'
                :user-ids='mtInfo?.attendees?.map((x: any) => x.userId)'/>
            </div>
            <div class='flex'>
              <div class='align-items-center detail-label flex'>
                {{ t('meeting.calendar.table.invited') }}
              </div>
              <div class='align-items-center flex font-bold'>
                {{ mtInfo?.guest }}
              </div>
            </div>
            <div class='flex gap-8'>
              <div class='flex'>
                <div class='align-items-center detail-label flex'>
                  {{ t('meeting.calendar.table.location') }}
                </div>
                <div
                  class='align-items-center cursor-pointer flex font-bold'
                  @click='showDialogMtR(mtInfo?.meetingRoom.id)'>
                  {{ mtInfo?.meetingRoom.name }}
                </div>
              </div>
              <div class='flex'>
                <div class='align-items-center flex mr-3'>
                  {{ t('meeting.calendar.table.time') }}
                </div>
                <div class='align-items-center flex font-bold'>
                  {{ moment(mtInfo?.startTime).format('HH:mm') }} -
                  {{ moment(mtInfo?.endTime).format('HH:mm') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <MeetingRoomForm
    v-if='showInfoMeetingRoom'
    :id='idMeetingRoom'
    :is-detail='true'
    :visible-dialog='showInfoMeetingRoom'
    @hide-dialog='hideDialogMtR'/>

  <MeetingConflictDialog
    v-if='showMeetingConflictDialog'
    :id='idMeeting'
    :visible-dialog='showMeetingConflictDialog'
    @hide-dialog='hideMeetingConflictDialog'/>

  <MeetingDetail
    v-if='visibleDetail'
    :id='idMeeting'
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

<script setup lang='ts'>
import { upperFirst } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { type MeetingInterface, MeetingType, } from '@/apps/meeting/model/meeting';
import {
  getBgClassForDay,
  getClassForMeeting,
  getGender,
} from '@/apps/meeting/views/meeting/components/meeting-class';
import MeetingConflictDialog from '@/apps/meeting/views/meeting/components/MeetingConflictDialog.vue';
import MeetingDetail from '@/apps/meeting/views/meeting/components/MeetingDetail.vue';
import MeetingRoomForm from '@/apps/meeting/views/meeting/components/room/MeetingRoomForm.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  meetingsInDay: {
    type: Array as PropType<MeetingInterface[]>,
    default: () => [],
  },
  display: {
    type: String,
    default: 'week',
  },
});
const { moment } = useMoment();
const { t } = useI18n();
const showInfoMeetingRoom = ref();
const idMeeting = ref();
const idMeetingRoom = ref();
const showMeetingConflictDialog = ref(false);
const visibleDetail = ref(false);

function showDialogMtR(id: string) {
  idMeetingRoom.value = id;
  showInfoMeetingRoom.value = true;
}

function hideDialogMtR() {
  showInfoMeetingRoom.value = false;
}

function handleShowMeetingConflictDialog(id: string) {
  idMeeting.value = id;
  showMeetingConflictDialog.value = true;
}

function hideMeetingConflictDialog() {
  showMeetingConflictDialog.value = false;
}

function showDetail(id: string) {
  idMeeting.value = id;
  visibleDetail.value = true;
}
</script>

<style scoped>
.detail-label {
  min-width: 15rem;
  min-height: 35px;
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
