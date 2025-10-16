<template>
  <div class='surface-0'>
    <DataTable
      v-bind='DEFAULT_DATATABLE_CONFIG'
      v-model:selection='selectedRows'
      group-rows-by='key'
      row-group-mode='rowspan'
      row-hover
      :scroll-height='dataTableScrollHeight'
      selection-mode='multiple'
      show-gridlines
      sort-mode='single'
      :value='listMeeting'>
      <Column
        body-class='p-0 border-1'
        body-style='height: 0'
        class='col-1 text-center w-7rem'
        field='key'
        :header="t('meeting.calendar.table.time')">
        <template #body='{ data: { key } }'>
          <div
            class='align-content-center flex flex-column h-full justify-content-center p-2 surface-section text-center'
            :class='getClassForDay(new Date(key))'>
            <div class='font-semibold mb-1'>
              {{ upperFirst(moment(key).format('ddd')).replace('T', t('meeting.meeting.weekDay')) }}
            </div>
            <small>{{ upperFirst(moment(key).format('DD/MM/YYYY')) }}</small>
          </div>
        </template>
      </Column>

      <Column
        body-class='col-4'
        field='content'
        :header="t('meeting.calendar.table.content')"
        style='width: 30%'>
        <template #body='{ data }'>
          <div
            :class='!isConfig ? getClassForMeeting(data) : ""'>
            <div
              v-if='data.content'
              class='cursor-pointer font-semibold hover:text-primary-600 inline-meeting mb-1'
              @click='showDetail(data)'>
              {{ data.content }}
            </div>
            <div class='flex justify-content-between'>
              <div
                v-if='data.startTime'
                class='mt-1'>
                <div class='align-items-center flex'>
                  <AppIcon
                    name='schedule'
                    size='1.5'
                    text/>
                  <label>{{ moment(data.startTime).format('HH:mm') }}
                    {{ data.endTime ? ` - ${moment(data.endTime).format('HH:mm')}` : '' }}</label>
                </div>
              </div>
              <div class='flex'>
                <AppIcon
                  v-if='data.isImportant'
                  v-tooltip.top="t('meeting.meeting.tooltip.importantMeeting')"
                  class='cursor-pointer'
                  fill
                  name='star'
                  size='1.5'
                  style='color: #f4b400'
                  text/>
                <AppIcon
                  v-if='data.isConflict'
                  v-tooltip.top="
                    t('meeting.calendar.clickToSeeDuplicateCalendar')
                  "
                  class='cursor-pointer'
                  name='report_problem'
                  size='1.5'
                  style='color: #f36f24'
                  text
                  @click='handleShowMeetingConflictDialog(data.id)'/>
              </div>
            </div>
          </div>
        </template>
      </Column>

      <Column
        class='col'
        field='hostId'
        :header="t('meeting.calendar.table.host')"
        style='width: 14rem'>
        <template #body='{ data: { hostId } }'>
          <div
            v-if='hostId'
            class='flex flex-column gap-2 text-center'>
            <div class='flex justify-content-center'>
              <AppUser
                avatar-size='2.5'
                :is-highlight='true'
                overlay-visible
                :user-id='hostId'/>
            </div>
            <div>{{
              usersMoreInfo[hostId]?.gender === 1 ? t('meeting.meeting.gender.male') : t('meeting.meeting.gender.female')
            }}: <strong>{{
              usersMoreInfo[hostId]?.fullName
            }}</strong>
            </div>
            <div>{{ usersMoreInfo[hostId]?.positionName?.join(', ') }}</div>
          </div>
        </template>
      </Column>

      <Column
        class='col'
        field='attendeeIds'
        :header="t('meeting.calendar.table.attend')"
        style='min-width: 14rem'>
        <template #body='{ data: { attendees, guest} }'>
          <div
            class='align-items-center flex flex-column gap-2'>
            <AppGroupAvatar
              v-if='attendees'
              avatar-size='2'
              :header="t('meeting.meeting.listAttendees')"
              :user-ids='attendees?.map((x: any) => x.userId)'/>
            <div>
              {{ guest }}
            </div>
          </div>
        </template>
      </Column>

      <Column
        class='col text-center'
        field='meetingRoom'
        :header="t('meeting.calendar.table.location')"
        style='width: 16%'>
        <template #body='{ data: { meetingRoom, meetingType, onlineUrl } }'>
          <div
            v-if='meetingRoom'
            class='cursor-pointer inline-meeting'
            @click='showDialogMtR(meetingRoom.id)'>
            {{ meetingRoom?.name }}
          </div>
          <div
            v-if='meetingType && meetingType == MeetingType.OFFLINE'
            class='cursor-pointer mt-2'
            @click='showDialogMtR(meetingRoom.id)'>
          </div>

          <AppIcon
            v-if='meetingType && meetingType !== MeetingType.OFFLINE'
            v-tooltip.top="t('meeting.meeting.onlineMeeting')"
            class='cursor-pointer'
            fill
            name='videocam'
            size='1.5'
            style='color: #0d99ff'
            text
            @click='openNewTab(onlineUrl)'/>
        </template>
      </Column>

      <Column
        v-if='isConfig'
        class='col text-center'
        field='creationTime'
        :header="t('meeting.calendar.table.creationTime')"
        style='min-width: 11rem'>
        <template #body='{ data: { createdTime } }'>
          <div v-if='createdTime'>
            {{ moment(createdTime).format('DD/MM/YYYY HH:mm') }}
          </div>
        </template>
      </Column>

      <Column
        v-if='isConfig'
        class='col'
        field='creatorId'
        :header="t('meeting.calendar.table.creationUser')"
        style='width: 8rem'>
        <template #body='{ data: { createdBy } }'>
          <div
            v-if='createdBy'
            class='flex justify-content-center'>
            <AppUser
              avatar-size='2.5'
              overlay-visible
              :user-id='createdBy'/>
          </div>
        </template>
      </Column>

      <Column
        v-if='isConfig'
        class='col text-center'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <span
            v-if='status'
            class='border-round-sm px-2 py-1 status-badge text-white'
            :class="`status-${status?.toString().toLowerCase() || ''}`">{{
              t(
                `media.common.table.statuses.${status?.toString().toLowerCase() || ''}`,
              )
            }}</span>
        </template>
      </Column>

      <Column
        v-if='isConfig'
        header-style='width: 3rem'
        selection-mode='multiple'>
        <template #body='{ data }'>
          <div
            v-if='data.flowId && data.status !== StatusMeetingEnum.APPROVED && data.status !== StatusMeetingEnum.CANCEL'
            class='flex justify-center'>
            <Checkbox
              v-model='selectedRows'
              :value='data'/>
          </div>
        </template>
      </Column>

      <Column
        v-if='isConfig'
        class='col text-center'
        :header="t('common.action')"
        style='width: 8rem'>
        <template #body='{ data }'>
          <ButtonIcon
            v-if='data?.id'
            v-tooltip.top="t('common.action')"
            class='text-color'
            icon='more_horiz'
            icon-size='1.7'
            rounded
            text
            @click='toggleActionMenu($event, data)'/>
        </template>
      </Column>

      <Column
        v-if='!isConfig'
        class='col'
        field='setup'
        :header="t('meeting.meeting.prepare')"
        style='width: 10rem'>
      </Column>

      <Column
        v-if='!isConfig'
        class='col text-center'
        :header="t('meeting.meeting.fileAttach')"
        style='width: 7rem'>
        <template #body='{ data: { fileAttachments } }'>
          <AppIcon
            v-if='
              fileAttachments?.filter(
                (x: FileAttachment) =>
                  x.objectType == FileType.DOCUMENTS_PREPARED,
              )?.length > 0
            '
            v-tooltip.top="t('meeting.meeting.fileAttach')"
            class='cursor-pointer text-primary'
            name='attach_file'
            size='1.5'
            @click='showFileAttach(fileAttachments)'/>
        </template>
      </Column>

      <Column
        v-if='!isConfig'
        class='col'
        field='note'
        :header="t('meeting.meeting.note')">
      </Column>
    </DataTable>

    <Menu
      ref='menuRef'
      :model='menuActions'
      :popup='true'>
      <template #item='{ item: { icon, label } }'>
        <MenuItem
          :class-icon="['mt-0', icon === 'delete' ? 'text-red-300' : '']"
          :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
          :icon='icon'
          :label='label'/>
      </template>
    </Menu>

    <Dialog
      v-bind='DEFAULT_DIALOG_CONFIG'
      v-model:visible='visibleDialogFiles'
      :header="t('meeting.meeting.listFileAttachments')"
      :maximizable='false'
      @hide='!visibleDialogFiles'>
      <UploadFilesGrid
        :is-view='true'
        :list-file='listFileAttach'>
        <template #header>
          <div></div>
        </template>
      </UploadFilesGrid>
    </Dialog>
  </div>
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

  <MeetingConflictDialog
    v-if='showMeetingConflictDialog'
    :id='meetingId'
    :visible-dialog='showMeetingConflictDialog'
    @hide-dialog='showMeetingConflictDialog = false'/>

  <MeetingRoomForm
    v-if='showInfoMeetingRoom'
    :id='idMeetingRoom'
    :is-detail='true'
    :visible-dialog='showInfoMeetingRoom'
    @hide-dialog='hideDialogMtR'/>

  <ViewFlow
    v-if='showViewFlowDialog'
    :id='meetingId'
    :visible-dialog='showViewFlowDialog'
    @hide-dialog='showViewFlowDialog = false'/>

  <Dialog
    v-model:visible='showDialogSetStatus'
    :dismissable-mask='true'
    :header="t('media.common.table.titleSetStatus')"
    modal
    style='width: 30rem'>
    <div class='flex flex-column flex-wrap gap-4'>
      <div
        v-for='(item, index) in StatusMeetingEnum'
        :key='index'
        class='align-items-center flex justify-content-between w-10rem'>
        <label
          class='ml-2'
          :for='`ingredient${index}`'>{{
            t(`media.common.table.statuses.${item.toLowerCase()}`)
          }}</label>
        <RadioButton
          v-model='selectedMeetingStatus'
          :input-id='`ingredient${index}`'
          :name='t(`media.common.table.statuses.${item.toLowerCase()}`)'
          :value='item'
          @change='handleUpdateStatusMedia'/>
      </div>
    </div>
  </Dialog>
  <DynamicDialog/>
</template>

<script lang='ts' setup>
import { get, upperFirst } from 'lodash';
import { storeToRefs } from 'pinia';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { deleteMeeting, updateStatusMeeting, } from '@/apps/meeting/graphql/meeting';
import type { FileAttachment } from '@/apps/meeting/model/fileAttachment';
import { FileType, type MeetingInterface, MeetingType, StatusMeetingEnum, } from '@/apps/meeting/model/meeting';
import ViewFlow from '@/apps/meeting/views/meeting/components/flow/ViewFlow.vue';
import { getClassForDay, getClassForMeeting, } from '@/apps/meeting/views/meeting/components/meeting-class';
import MeetingConflictDialog from '@/apps/meeting/views/meeting/components/MeetingConflictDialog.vue';
import MeetingDetail from '@/apps/meeting/views/meeting/components/MeetingDetail.vue';
import MeetingRoomForm from '@/apps/meeting/views/meeting/components/room/MeetingRoomForm.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import UploadFilesGrid from '@/common/components/custom/UploadFilesGrid.vue';
import { DateTimeFormat, DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  listDateProp: {
    type: Array as PropType<Date[]>,
    default: () => [],
  },
  listMeetingProp: {
    type: Array as PropType<MeetingInterface[]>,
    default: () => [],
  },
  isConfig: {
    type: Boolean,
    default: true,
  },
  display: {
    type: String,
    default: 'week',
  },
});
const emits = defineEmits(['delete-success', 'update-success', 'selectedRows']);
const showMeetingConflictDialog = ref(false);
const visibleDetail = ref(false);
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
store.fetchAllUsers();

const {
  mutate,
  onDone
} = deleteMeeting();
const meetingId = ref();
const confirm = useConfirm();
const listFileAttach = ref();
const visibleDialogFiles = ref(false);
const { moment } = useMoment();
const listMeeting = computed((): MeetingInterface[] => {
  let m1 = props.listMeetingProp
    .filter((m) =>
      props.listDateProp
        .map((d) => moment(d).format(DateTimeFormat.ISO_LOCAL_DATE))
        .includes(moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE)),
    )
    .map((m) => ({
      ...m,
      key: moment(m.startTime).format(DateTimeFormat.ISO_LOCAL_DATE),
    }));
  const m2 = props.listDateProp
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
  return rs;
});
const showInfoMeetingRoom = ref();
const idMeetingRoom = ref();
const selectedMeetingStatus = ref('');
const showDialogSetStatus = ref(false);
const showViewFlowDialog = ref(false);

function showDialogMtR(id: string) {
  idMeetingRoom.value = id;
  showInfoMeetingRoom.value = true;
}

function openNewTab(url: string) {
  window.open(url, '_blank');
}

function hideDialogMtR() {
  showInfoMeetingRoom.value = false;
}

const { t } = useI18n() || {};

const menuRef = ref();
const selectedRows = ref<MeetingInterface[]>([]);
const dataTableScrollHeight = ref(calculateHeight());
window.onresize = () => dataTableScrollHeight.value = calculateHeight();
const {
  mutate: updateStatusMeetingMutate,
  onDone: updateStatusMeetingOnDone
} =
  updateStatusMeeting();

const resetSelectedRows = () => {
  selectedRows.value = [];
};

const openForm = inject('openForm', (id?: string) => void {});

function toggleActionMenu(event: Event, data: MeetingInterface) {
  menuRef.value.toggle(event);
  selectedRows.value = [data];
  meetingId.value = data.id;
}

function showDetail(data: MeetingInterface) {
  meetingId.value = data.id;
  visibleDetail.value = true;
  selectedRows.value = [data];
}

watch(selectedRows, () => {
  const valid = selectedRows.value?.filter(row => row.flowId
    && row.status !== StatusMeetingEnum.APPROVED
    && row.status !== StatusMeetingEnum.CANCEL);
  emits('selectedRows', valid);
});

function showFileAttach(files: FileAttachment[]) {
  visibleDialogFiles.value = true;
  listFileAttach.value = files;
}

const menuActions = [
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'edit',
    command: () => {
      editMeeting();
    },
  },
  {
    key: 'view-flow',
    label: t('common.viewFlowStep'),
    icon: 'lan',
    command: () => {
      showViewFlowDialog.value = true;
    },
  },
  // {
  //   key: 'set-status',
  //   label: t('media.common.table.setStatus'),
  //   icon: 'display_settings',
  //   command: () => {
  //     selectedMeetingStatus.value = selectedRows.value[0]?.status || '';
  //     showDialogSetStatus.value = true;
  //   },
  // },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'delete',
    command: () => {
      confirm.require({
        message: t('common.confirmDelete', {
          itemType: 'lịch họp',
          itemName: selectedRows.value[0]?.content
        }),
        acceptLabel: t('common.delete'),
        acceptClass: 'p-button-danger',
        header: t('common.confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          deleteMeetingFn();
        }
      });
    },
  },
];

function handleUpdateStatusMedia() {
  updateStatusMeetingMutate({
    id: selectedRows.value[0]?.id,
    status: selectedMeetingStatus.value,
  });
}

updateStatusMeetingOnDone(() => {
  showDialogSetStatus.value = false;
});

function editMeeting() {
  openForm(selectedRows.value[0]?.id);
}

function deleteMeetingFn() {
  mutate({ id: selectedRows.value[0]?.id });
}

updateStatusMeetingOnDone(() => {
  emits('update-success');
});

function calculateHeight() {
  let height = window.innerHeight - 180;
  if (props.isConfig) {
    height = height - 37;
  }
  return `${height}px`;
}

function handleShowMeetingConflictDialog(id: string) {
  meetingId.value = id;
  showMeetingConflictDialog.value = true;
}

onDone(() => {
  emits('delete-success');
  toastSuccess({ message: t('meeting.meeting.message.deleteSuccess') });
});

const organizations = ref();
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []);
});

defineExpose({ resetSelectedRows });
</script>

<script lang='ts'>
export default { name: 'MeetingGrid' };
</script>

<style scoped>
.saturdayBgc {
  background-color: #FEFBEF !important;
  color: #DE911D !important;
}

.sundayBgc {
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
