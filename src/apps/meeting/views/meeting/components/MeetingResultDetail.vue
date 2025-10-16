<template>
  <DataTable
    v-bind="{
      ...DEFAULT_DATATABLE_CONFIG,
      'scroll-height': 'calc(100vh - 12rem)',
    }"
    v-model:editing-rows='editingRows'
    data-key='userId'
    edit-mode='row'
    :value='attendees'
    @row-edit-save='saveUser'>

    <Column
      class='col-3'
      field='userId'
      :header='t("meeting.meeting.attendees")'
      style='width: 40%'>
      <template #body='{data}'>
        <AppUser
          avatar-size='2.5'
          info-visible
          :infos='["positionName", "departments"]'
          :is-highlight='data.isHost'
          name-visible
          :user-id='data.userId'/>
      </template>
    </Column>

    <Column
      class='col-2'
      :header='t("meeting.meeting.seen")'>
      <template #body='{data: {seenTime}}'>
        <div v-if='seenTime'>
          <div class='text-center text-green-600'>
            <AppIcon
              name='done_all'
              size='1.5'/>
          </div>
          <div class='text-center'>{{ moment(seenTime).format('DD/MM/yyyy HH:mm') }}</div>
        </div>
      </template>
    </Column>

    <Column
      body-style='text-align: center'
      class='col-2'
      field='participate'
      :header='t("meeting.meeting.participate")'>
      <template #body='{data,index}'>
        <InputSwitch
          :disabled='true'
          :model-value='data.participate'
          @update:model-value='updateUser($event,index)'/>
      </template>
      <template #editor='{ data,field }'>
        <InputSwitch v-model='data[field]'/>
      </template>
    </Column>

    <Column
      class='col-3'
      field='reason'
      :header="t('meeting.meeting.reason')">
      <template #body='{data: {reason}}'>
        {{ reason }}
      </template>

      <template
        #editor='{ data,field}'>
        <Textarea
          v-if="!data['participate']"
          v-model='data[field]'
          cols='20'
          rows='1'/>
        <small
          v-if="!data['participate'] && !data['reason']"
          class='p-error'>
          {{ t('meeting.meeting.reasonRequired') }}
        </small>
      </template>
    </Column>

    <!--    <Column-->
    <!--      body-style='text-align:center'-->
    <!--      class='col-2'-->
    <!--      :row-editor='true'-->
    <!--      style='width: 10%; min-width: 8rem'>-->
    <!--    </Column>-->

  </DataTable>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import moment from 'moment';
import Column from 'primevue/column';
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserEdge } from '@/apps/admin/model/User';
import { getAttendeeByMeetingId, updateAttendee } from '@/apps/meeting/graphql/meeting-attendee';
import type { AttendeeInterface } from '@/apps/meeting/model/meeting';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  id: {
    type: String,
    default: null
  }
});
const { t } = useI18n() || {};
const attendees = ref<any[]>([]);
const {
  mutate,
  onDone
} = updateAttendee();
const { onResult } = getAttendeeByMeetingId({
  id: props.id,
  pageable: {
    page: 0,
    size: 999999
  }
});

const editingRows = ref<any[]>([]);
const { user } = useUserStore();

watch(editingRows, (newVal) => {
  if (newVal.length > 0 && newVal[0]?.userId !== user.id) {
    nextTick(() => {
      editingRows.value = [];
    });
  }
});

onResult((res) => {
  const { edges } = get(res, 'data.getAttendeeByMeetingId', {
    totalCount: 0,
    edges: []
  });

  attendees.value = [
    ...attendees.value,
    ...edges.map((edge: UserEdge) => edge.node)
  ]
    .map((x: AttendeeInterface) => ({
      id: x.id,
      seen: x.seen,
      seenTime: x.seenTime,
      participate: x.participate,
      reason: x.reason,
      userId: x.userId,
      isHost: x.isHost,
    }))
    .sort((a, b) => {
      if (a.isHost && !b.isHost) {
        return -1;
      }
      if (!a.isHost && b.isHost) {
        return 1;
      }
      return 0;
    });
});

function saveUser(event: any) {
  let {
    newData,
    index
  } = event;
  if (!newData.participate && !newData.reason) {
    toastError({ message: t('meeting.meeting.reasonRequired') });
    editingRows.value = [...editingRows.value, attendees.value[index]];
    return;
  }
  mutate({
    id: newData.id,
    participate: newData.participate,
    reason: !newData.participate ? newData.reason : ''
  });
  attendees.value[index] = {
    ...attendees.value[index],
    participate: newData.participate,
    reason: !newData.participate ? newData.reason : ''
  };
}

function updateUser(event: any, index: number) {
  attendees.value[index] = {
    ...attendees.value[index],
    participate: event
  };

  editingRows.value = [...editingRows.value, attendees.value[index]];

}

onDone(() => {
  toastSuccess({ message: t('meeting.meeting.message.changeMeetingResultSuccess') });
});
</script>

<script lang='ts'>
export default { name: 'MeetingResultDetail' };
</script>

<style scoped>

</style>