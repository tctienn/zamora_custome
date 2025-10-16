<template>
  <div
    class='flex flex-column gap-3'
    style='margin-top: 50px'>
    <div class='flex gap-2'>
      <div class='inline-block pt-3'>{{ t('meeting.meeting.content') }}:</div>
      <div
        class='col font-semibold pl-0'
        :class='meeting.status === StatusMeetingEnum.CANCEL && "text-red line-through"'>{{ meeting.content }}
      </div>
    </div>

    <div class='align-items-center flex gap-8'>
      <div class='align-items-center flex gap-2 p-float-label'>
        <AppIcon
          name='schedule'
          size='1.5'/>
        <div>{{ t('meeting.meeting.startTime') }}:</div>
        <div class='font-semibold'>
          {{ moment(meeting.startTime).format('DD/MM/YYYY HH:mm') }}
        </div>
      </div>
      <div class='align-items-center flex gap-2 p-float-label'>
        <div>{{ t('meeting.meeting.finishTime') }}:</div>
        <div class='font-semibold'>
          {{ meeting.endTime ? moment(meeting.endTime).format('DD/MM/YYYY HH:mm') : '' }}
        </div>
      </div>
    </div>

    <div class='flex flex-column gap-3'>
      <div class='align-content-center p-float-label'>
        {{ t('meeting.meeting.host') }}:
      </div>
      <div class='ml-6'>
        <AppUser
          avatar-size='2.5'
          info-visible
          :infos="['positionName', 'departments']"
          is-highlight
          name-visible
          :user-id='meeting.hostId'/>
      </div>
    </div>

    <div
      class='flex flex-column gap-2'>
      <div class='flex gap-2'>
        <div class='align-content-center flex'>
          <AppIcon
            name='diversity_3'
            size='1.5'/>
        </div>
        <div class='align-content-center align-items-center flex gap-3'>
          {{ t('meeting.meeting.attendees') }}:
          <Badge
            v-if='meeting.attendees'
            :value='meeting.attendees.length'/>
        </div>
      </div>

      <div
        class='flex flex-column gap-2'>
        <div
          v-for='(data, index) in meeting.attendees'
          :key='index'
          class='flex ml-6'>
          <AppUser
            avatar-size='2.5'
            class='w-5'
            :full-name-color='checkSubstituteParticipant(data.userId) ? "text-red" : ""'
            info-visible
            :infos="['positionName', 'departments']"
            name-visible
            :user-id='data.userId'/>
          <div
            v-if='checkSubstituteParticipant(data.userId)'
            class='align-items-center flex gap-4'>
            <AppIcon
              v-tooltip.top='t("meeting.meeting.substituteParticipant")'
              name='sync_alt'
              size='1.5'/>
            <AppUser
              avatar-size='2.5'
              info-visible
              :infos="['positionName', 'departments']"
              name-visible
              :user-id='substituteParticipants.find((item: any) => item.userId === data.userId).substituteParticipant'/>
          </div>
        </div>
      </div>

    </div>

    <div class='flex gap-2'>
      <div>
        <AppIcon
          name='location_on'
          size='1.5'/>
      </div>
      <div>{{ t('meeting.meeting.meetingRoom') }}:</div>
      <div class='font-semibold'>
        {{ meeting.meetingRoom?.name }}
      </div>
    </div>

    <div
      v-if='meeting?.onlineUrl'
      class='flex gap-2'>
      <div>{{ t('meeting.meeting.onlineLink') }}:</div>
      <div class='font-semibold'>
        <a
          v-if='meeting?.onlineUrl'
          class='font-semibold hover:underline text-blue-600'
          :href='meeting.onlineUrl'
          rel='noopener noreferrer'
          target='_blank'>
          {{ meeting.onlineUrl }}
        </a>

      </div>
    </div>

    <div class='flex gap-8'>
      <div class='flex gap-2'>
        {{ t('meeting.meeting.meetingType') }}:
        <div class='font-semibold'>
          {{
            meeting.meetingType && meeting.meetingType !== MeetingType.OFFLINE
              ? t('meeting.meeting.online')
              : t('meeting.meeting.normal')
          }}
        </div>
      </div>

      <div class='flex gap-2 ml-8'>
        {{ t('meeting.meeting.important') }}:
        <div class='font-semibold'>
          {{
            meeting.isImportant
              ? t('meeting.meeting.yes')
              : t('meeting.meeting.no')
          }}
        </div>
      </div>
    </div>

    <div class='flex gap-1'>
      <div>{{ t('meeting.meeting.guest') }}:</div>
      <div class='font-semibold'>
        {{ meeting.guest }}
      </div>
    </div>

    <div class='flex gap-1'>
      <div>{{ t('meeting.meeting.participatingDepartments') }}:</div>
      <div class='font-semibold'>
        <ul
          v-for='(dep, index) in meeting.organizations'
          :key='index'>
          <li>{{ dep.name }}</li>
        </ul>
      </div>
    </div>

    <div class='flex gap-1'>
      <div>{{ t('meeting.meeting.prepare') }}:</div>
      <div
        v-if='meeting.setup'
        class='font-semibold'>
        {{ meeting.setup }}
      </div>
    </div>

    <div class='flex gap-1'>
      <div>{{ t('meeting.meeting.mediaDevices') }}:</div>
      <div
        v-if='meeting.mediaDeviceIds'
        class='font-semibold'>
        {{ getMediaDevices(meeting.mediaDeviceIds) }}
      </div>
    </div>

    <div class='flex gap-1'>
      <div>{{ t('meeting.meeting.numberAttendees') }}:</div>
      <div class='font-semibold'>
        {{ meeting.numberAttendees }}
      </div>
    </div>

    <div class='align-items-center flex gap-1'>
      <div class='align-items-center flex gap-1'>
        <AppIcon
          name='error_outline'
          size='1.5'/>
        <div>{{ t('meeting.meeting.note') }}:</div>
      </div>
      <div class='font-semibold'>
        {{ meeting.note }}
      </div>
    </div>

    <div>
      <UploadFilesGrid
        :is-view='true'
        :list-file='
          meeting.fileAttachments?.filter(
            (x) => x.objectType == FileType.DOCUMENTS_PREPARED,
          )
        '>
        <template #header>
          <div class='flex'>
            <div>
              <AppIcon
                name='attach_file'
                size='1.5'/>
            </div>
            <div class='font-bold'>{{ t('meeting.meeting.attachments') }}</div>
          </div>
        </template>
      </UploadFilesGrid>
    </div>

    <div>
      <UploadFilesGrid
        :is-view='true'
        :list-file='
          meeting.fileAttachments?.filter(
            (x) => x.objectType == FileType.REPORT_DOCUMENTS,
          )
        '>
        <template #header>
          <div class='flex'>
            <div>
              <AppIcon
                name='attach_file'
                size='1.5'/>
            </div>
            <div class='font-bold'>
              {{ t('meeting.meeting.reportMeeting') }}
            </div>
          </div>
        </template>
      </UploadFilesGrid>
    </div>

    <div v-if='meeting.status === StatusMeetingEnum.CANCEL'>
      <div class='bg-red-50 border-1 border-dashed border-red-300 border-round p-2 w-full'>
        <div class='align-items-center flex justify-content-between'>
          <div>
            <div class='flex gap-2'>
              <AppIcon
                name='notifications'
                size='1.5'/>
              <div>{{ t('meeting.meeting.meetingResonCancel') }}</div>
            </div>
            <div class='ml-8'>
              {{ attendee.reason }}
            </div>
          </div>
          <div class='align-items-center flex flex-column'>
            <AppUser
              v-tooltip.top="t('meeting.meeting.canceledBy')"
              avatar-size='2.5'
              :user-id='attendee.userId'/>
            {{ moment(attendee.cancelTime).format('DD/MM/YYYY HH:mm') }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if='new Date() < new Date(meeting.startTime) && meeting.status !== StatusMeetingEnum.CANCEL'
      class='flex flex-row-reverse w-full'>
      <Button
        v-if='user.id === meeting.hostId'
        icon='pi pi-ban'
        :label="t('meeting.meeting.cancelMeeting')"
        severity='danger'
        @click='showForm =true'/>
      <div
        v-else-if='meeting.attendees?.some(a => a.userId === user.id)'
        class='flex flex-row-reverse gap-2 w-full'>
        <Button
          icon='pi pi-file-edit'
          :label="t('meeting.meeting.unMeeting')"
          severity='warning'
          @click='showForm =true'/>
        <Button
          icon='pi pi-users'
          :label="t('meeting.meeting.selectSubstituteParticipant')"
          severity='contrast'
          @click='visibleSubstituteParticipantDialog =true'/>
      </div>
    </div>

    <div
      v-if='task'
      class='bottom-0 fixed flex gap-2 justify-content-center mb-1 w-full'>
      <Button
        v-for='outcome in task?.outcomes'
        :key='outcome?.name'
        class='border-none'
        :disabled='outcome?.disable'
        :style='{background: outcome?.color, color: (outcome?.color ? calculateColorBasedOnBackgroundColor(outcome?.color || ""): undefined) }'
        @click='openCompleteTaskDialog(outcome)'>
        {{ outcome.label }}
      </Button>
    </div>
  </div>

  <ReasonFormCancelMeeting
    v-if='showForm'
    :id='id'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'
    @submit-done='closeSidebar'/>

  <CompletedTaskForm
    v-if='visibleCompleteTask'
    v-model:visible='visibleCompleteTask'
    :created-by='meeting.createdBy'
    :current-node-id='task?.nodeId'
    :outcome='currentOutcome'
    :task-id='task?.id'
    :work-id='task?.workId'
    @hide-dialog='closeSidebar'/>

  <SubstituteParticipantDialog
    v-if='visibleSubstituteParticipantDialog'
    :id='id'
    v-model:visible='visibleSubstituteParticipantDialog'
    :substitute-participant='substituteParticipants?.find((item: any) => item.userId === user.id)?.substituteParticipant'
    @hide-dialog='hideSubstituteParticipantDialog'/>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import moment from 'moment';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserEdge } from '@/apps/admin/model/User';
import { getAllMediaDeviceByStatusActive } from '@/apps/meeting/graphql/media-device';
import { viewDetail } from '@/apps/meeting/graphql/meeting';
import { getAttendeeByMeetingId } from '@/apps/meeting/graphql/meeting-attendee';
import { getAllSubstituteParticipants } from '@/apps/meeting/graphql/substitute-participant';
import type { IMediaDevice } from '@/apps/meeting/model/mediaDevice';
import {
  type AttendeeInterface,
  FileType,
  type MeetingInterface,
  MeetingType,
  StatusMeetingEnum,
} from '@/apps/meeting/model/meeting';
import CompletedTaskForm from '@/apps/meeting/views/meeting/components/flow/CompletedTaskForm.vue';
import ReasonFormCancelMeeting from '@/apps/meeting/views/meeting/components/ReasonFormCancelMeeting.vue';
import SubstituteParticipantDialog from '@/apps/meeting/views/meeting/components/SubstituteParticipantDialog.vue';
import { getTaskByObjectId } from '@/apps/work-flow/api/graphql/task';
import type { Outcome } from '@/apps/work-flow/model/flow';
import type { Task } from '@/apps/work-flow/model/process/work';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import UploadFilesGrid from '@/common/components/custom/UploadFilesGrid.vue';
import { calculateColorBasedOnBackgroundColor } from '@/common/helpers/color-util';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
});
const emits = defineEmits(['submit-done']);
const meeting = ref<MeetingInterface>({} as MeetingInterface);
const { t } = useI18n();
const { onResult } = viewDetail(props.id);
const { user } = useUserStore();
const showForm = ref(false);
const currentOutcome = ref<Outcome>();
const visibleSubstituteParticipantDialog = ref(false);

onResult((res) => {
  meeting.value = res.data.viewDetail;
});
const visibleCompleteTask = ref(false);

const hideDialogFn = () => {
  showForm.value = false;
};

const closeSidebar = () => {
  emits('submit-done');
};

const { onResult: getAttendeeByMeetingIdResult } = getAttendeeByMeetingId({
  id: props.id,
  pageable: {
    page: 0,
    size: 999999
  }
});

const attendees = ref<any>([]);
const attendee = ref<any>([]);

const substituteParticipants = ref<any>([]);

const {
  onResult: getAllSubstituteParticipantsResult,
  refetch: getAllSubstituteParticipantsRefetch
} = getAllSubstituteParticipants(props.id);

getAllSubstituteParticipantsResult((res) => {
  substituteParticipants.value = res.data.getAllSubstituteParticipants;
});

getAttendeeByMeetingIdResult((res) => {
  const { edges } = get(res, 'data.getAttendeeByMeetingId', {
    totalCount: 0,
    edges: []
  });
  attendees.value = edges.map((edge: UserEdge) => edge.node);

  attendee.value = attendees.value.find((a: AttendeeInterface) => a.isHost);
});

function openCompleteTaskDialog(outcome: Outcome) {
  currentOutcome.value = outcome;
  visibleCompleteTask.value = true;
}

const task = ref();

const { onResult: getTaskByObjectIdResult } = getTaskByObjectId(props.id);

getTaskByObjectIdResult((res) => {
  task.value = res.data?.getTaskByObjectId as Task;
});

const mediaDevices = ref<IMediaDevice[]>([]);
const { onResult: getAllMediaDeviceByStatusActiveResult } =
  getAllMediaDeviceByStatusActive();

getAllMediaDeviceByStatusActiveResult((res) => {
  mediaDevices.value = res.data.getAllActiveMediaDevices;
});

const getMediaDevices = (ids: string[]) => {
  return mediaDevices.value
    .filter(device => ids.includes(device.id))
    .map(device => device.name).join(', ');
};

const hideSubstituteParticipantDialog = () => {
  getAllSubstituteParticipantsRefetch();
  visibleSubstituteParticipantDialog.value = false;
};

const checkSubstituteParticipant = (userId: string) => {
  return substituteParticipants.value.some((item: any) => item.userId === userId);
};

</script>

<script lang='ts'>
export default { name: 'GeneralMeetingDetail' };
</script>

<style scoped>
.text-red {
  color: #FF4406
}
</style>
