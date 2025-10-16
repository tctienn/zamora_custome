<template>
  <div class='align-items-center flex justify-content-between mb-2'>
    <label
      v-required
      class='font-bold'>{{ t('meeting.meeting.meetingRoom') }}</label>
    <AppIcon
      ref='addFileRef'
      v-tooltip="'Tạo mới phòng họp'"
      class='cursor-pointer text-primary'
      name='add_circle'
      size='1.5'
      @click='()=>visibleDialog=true'/>
  </div>
  <Dropdown
    v-model='meetingRoom'
    class='p-component w-full'
    option-label='name'
    option-value='id'
    :options='meetingRooms'
    placeholder='Chọn phòng họp'
    show-clear>
  </Dropdown>
  <!--  <InputText-->
  <!--    v-model='meetingRoom'-->
  <!--    class='p-component p-inputtext w-full'-->
  <!--    maxlength='255'/>-->
  <input
    v-model='meetingRoom'
    hidden
    name='roomId'>
  <MeetingRoomForm
    v-if='visibleDialog'
    :is-sidebar='false'
    :visible-dialog='visibleDialog'
    @hide-dialog='hideDialogFn'>
  </MeetingRoomForm>
</template>

<script setup lang="ts">
import { get } from 'lodash';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllMeetingRoomByStatusActive } from '@/apps/meeting/graphql/meeting-room';
import type { IMeetingRoom } from '@/apps/meeting/model/meeting-room';
import MeetingRoomForm from '@/apps/meeting/views/meeting/components/room/MeetingRoomForm.vue';

const { t } = useI18n();
const meetingRoom = defineModel<string>();
const visibleDialog = ref(false);
const meetingRooms = ref<IMeetingRoom[]>([]);

const {
  onResult: onResultMeetingRoom,
  refetch: refetchMeetingRoom
} = getAllMeetingRoomByStatusActive();

onResultMeetingRoom((res) =>{
  meetingRooms.value = get(res, 'data.getAllActiveMeetingRooms');
});

function hideDialogFn() {
  refetchMeetingRoom();
  visibleDialog.value = false;
}
</script>

<style scoped>

</style>