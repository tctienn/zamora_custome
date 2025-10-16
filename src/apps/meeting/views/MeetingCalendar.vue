<template>
  <Toolbar class='align-content-center h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('meeting.meeting.meetingSchedule') }} ({{ countMeeting }})
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex flex-warp gap-1 h-3rem mr-1 my-1'>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("meeting.meeting.bookingMeeting")'
          @click='visibleForm = true'>
        </Button>
        <Button
          class='focus:shadow-none font-normal gap-2 hover:surface-200'
          label='Export'
          severity='secondary'
          @click='toggleExportExtension'>
          <template #icon>
            <i
              class='pi pi-file-export'
              style='margin-top: 1px'></i>
            <i class='flex-order-2 mt-1 pi pi-angle-down'/>
          </template>
        </Button>
        <Button
          class='focus:shadow-none font-normal gap-2 hover:surface-200'
          :label='t("meeting.meeting.printSchedule")'
          severity='secondary'
          @click='togglePrintExtension'>
          <template #icon>
            <i
              class='pi pi-print'
              style='margin-top: 1px'></i>
            <i class='flex-order-2 mt-1 pi pi-angle-down'/>
          </template>
        </Button>
        <ButtonIcon
          class='focus:shadow-none font-normal hover:surface-200'
          icon='restart_alt'
          label='Refresh'
          outlined
          @click='getRefetch'/>
      </div>
    </template>
  </Toolbar>
  <div class='flex flex-column gap-2 h-full'>

    <MeetingTopDisplayPanel
      v-model:display='display'
      v-model:filterMeetingStatus='filterMeetingStatus'
      v-model:month='month'
      v-model:showRow='showRow'
      v-model:userIds='userIds'
      v-model:week='week'
      v-model:year='year'
      class='border-1 border-300 border-round-sm p-1 surface-0'/>
    <MeetingGrid
      v-if='!showRow'
      :display='display'
      :is-config='false'
      :list-date-prop='dateBetween'
      :list-meeting-prop='filterListMeeting'/>

    <MeetingViewGrid
      v-else
      :display='display'
      :list-date-prop='dateBetween'
      :list-meeting-prop='filterListMeeting'/>
  </div>
  <Menu
    ref='extensionMenuRef'
    :model='isExport ? itemsExport : itemsPrint'
    :popup='true'>
    <template #item='{ item,label }'>
      <MenuItem
        :class-icon="['mt-0', item.icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', item.icon === 'delete' ? 'text-red-300' : '']"
        :icon='item.icon'
        :label='label'/>
    </template>
  </Menu>
  <div class='hidden'>
    <PrintComponent
      ref='printReportComponent'
      :document-title=' `Lịch họp tuần tháng từ ${moment(startDate).format(`DD/MM/YYYY`)} đến
       ${moment(endDate).format(`DD/MM/YYYY`)}`'>
      <template #component>
        <MeetingScheduled
          :list-date-prop='dateBetween'
          :list-meeting-prop='listMeeting'>
        </MeetingScheduled>
      </template>
    </PrintComponent>
  </div>

  <BookingMeetingSidebar
    v-if='visibleForm'
    :visible-form='visibleForm'
    @hide-dialog='hideBookingMeetingSidebar'/>
</template>

<script setup lang='ts'>
import { clone, get } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import { computed, inject, onMounted, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { exportExcel } from '@/apps/meeting/api/rest/meetingApi';
import { listMeetingByStartEnd } from '@/apps/meeting/graphql/meeting';
import { getAllMeetingRoomByStatusActive } from '@/apps/meeting/graphql/meeting-room';
import { type ExportMeetingRequestDTO, MeetingStatus } from '@/apps/meeting/model/meeting';
import type { IMeetingRoom } from '@/apps/meeting/model/meeting-room';
import BookingMeetingSidebar from '@/apps/meeting/views/meeting/components/BookingMeetingSidebar.vue';
import MeetingScheduled from '@/apps/meeting/views/meeting/components/export/MeetingScheduled.vue';
import PrintComponent from '@/apps/meeting/views/meeting/components/export/PrintComponent.vue';
import {
  currentWeekNumber,
  getDatesInMonth,
  getDatesInWeek
} from '@/apps/meeting/views/meeting/components/meeting-calendar';
import MeetingTopDisplayPanel from '@/apps/meeting/views/meeting/components/MeetingTopDisplayPanel.vue';
import MeetingGrid from '@/apps/meeting/views/meeting/MeetingGrid.vue';
import MeetingViewGrid from '@/apps/meeting/views/meeting/MeetingViewGrid.vue';
import { DateTimeFormat } from '@/common/constants';
import { downloadFile } from '@/common/helpers/file-utils';
import { useGlobalSearchStore } from '@/common/store/search';

const { t } = useI18n();
const showRow = ref(false);
const display = ref<'week' | 'month'>('week');
const filterMeetingStatus = ref(MeetingStatus.ALL);
const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());
const week = ref(currentWeekNumber());
const dateBetween = ref<Date[]>([]);
const listMeeting = ref();
const startDate = ref<Date>();
const endDate = ref<Date>();
const visibleForm = ref(false);
const countMeeting = ref(0);

const userIds = ref<string[]>([]);
const filterListMeeting = ref();
const searchTerm = inject('searchTerm', ref(''));

watch(
  [searchTerm, display, year, month, week, userIds],
  () => {
    setFromAndToDate(display.value);
  },
  { deep: true }
);

onMounted(() => {
  setFromAndToDate(display.value);
});

watch(filterMeetingStatus, () => {
  applyFilter();
});

const {
  refetch: getRefetch,
  variables: getVariable,
  onResult: getResult
} = listMeetingByStartEnd();

getResult((res) => {
  listMeeting.value = res.data.listMeetingByStartEnd;
  countMeeting.value = listMeeting.value.length;
  filterListMeeting.value = clone(listMeeting.value);
  applyFilter();
});

function getMeeting() {
  getVariable.value = {
    searchModel: {
      keyword: searchTerm.value,
      userIds: userIds.value,
      startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
      endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
      isConfig: false
    }
  };
}

function hideBookingMeetingSidebar() {
  visibleForm.value = false;
  getRefetch();
}

const refreshMeeting = ref(false);
provide('refreshMeeting', refreshMeeting);

watch(refreshMeeting, (newValue) => {
  if (newValue) {
    getRefetch();
    refreshMeeting.value = false;
  }
});

function setFromAndToDate(display: string) {
  const dates = display === 'week' ? getDatesInWeek(year.value, week.value) : getDatesInMonth(year.value, month.value);

  dateBetween.value = clone(dates);
  startDate.value = dates.shift();
  endDate.value = dates.pop();

  getMeeting();
}

function requestExport(): ExportMeetingRequestDTO {
  return {
    isLeader: false,
    startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
    endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
    isConfig: false,
    type: display.value === 'week' ? 'WEEKLY' : 'MONTHLY'
  };
}

const isPrinting = ref<boolean>(false);
const printReportComponent = ref();
const itemsExport = ref<MenuItem[]>([
  {
    label: t('meeting.meeting.fileExportName') + '-F01',
    icon: 'file_download',
    command: () => {
      exportExcel(requestExport()).then((response) => {
        if (typeof response === 'object') {
          downloadFile(response, `Lịch họp tuần tháng từ ${moment(startDate.value).format('DD/MM/YYYY')} đến ${moment(endDate.value).format('DD/MM/YYYY')}` + '.xlsx');
        }
      });
    },
    loading: false,
  },
  {
    label: t('meeting.meeting.fileExportName') + '-F02',
    icon: 'file_download',
    command: () => {
    }
  },
]);

const itemsPrint = ref<MenuItem[]>([
  {
    label: t('common.print') + '-F01',
    icon: 'print',
    command: () => {
      isPrinting.value = true;
      printReportComponent.value.print();
      isPrinting.value = false;
    }
  },
  {
    label: t('common.print') + '-F02',
    icon: 'print',
    command: () => {
    }
  }
]);

const isExport = ref(true);
const extensionMenuRef = ref();

function toggleExportExtension(event: Event) {
  isExport.value = true;
  extensionMenuRef.value.toggle(event);
}

function togglePrintExtension(event: Event) {
  isExport.value = false;
  extensionMenuRef.value.toggle(event);
}

function applyFilter() {
  const now = moment();

  switch (filterMeetingStatus.value) {
  case MeetingStatus.UPCOMING:
    filterListMeeting.value = listMeeting.value.filter((m: any) => {
      const start = moment(m.startTime);
      return start.isAfter(now) && start.diff(now, 'minutes') <= 60;
    });
    break;

  case MeetingStatus.ONGOING:
    filterListMeeting.value = listMeeting.value.filter((m: any) =>
      moment(m.startTime).isBefore(now) && moment(m.endTime).isAfter(now)
    );
    break;

  case MeetingStatus.FINISHED:
    filterListMeeting.value = listMeeting.value.filter((m: any) =>
      moment(m.endTime).isBefore(now)
    );
    break;

  case MeetingStatus.ALL:
  default:
    filterListMeeting.value = [...listMeeting.value];
    break;
  }
}

const { setFields } = useGlobalSearchStore();
const {
  submit,
  model
} = storeToRefs(useGlobalSearchStore());

watch(submit, () => {
  getVariable.value = {
    searchModel: {
      roomIds: model.value.roomIds,
      hostIds: model.value.hostIds,
      userIds: model.value.userIds,
      keyword: searchTerm.value,
      startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
      endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
      isConfig: false
    }
  };
});

const meetingRooms = ref<IMeetingRoom[]>([]);

const { onResult: onResultMeetingRoom, } = getAllMeetingRoomByStatusActive();

onResultMeetingRoom((res) => {
  meetingRooms.value = get(res, 'data.getAllActiveMeetingRooms');
});

const mtRooms = computed(() => meetingRooms.value.map((data) => ({
  name: data.name,
  id: data.id
})));

setFields({
  hostIds: {
    label: t('meeting.meeting.host'),
    type: String,
    col: 6,
    isChooseUser: true,
    isMultiSelect: true,
  },
  userIds: {
    label: t('meeting.meeting.attendees'),
    type: String,
    col: 6,
    isChooseUser: true,
    isMultiSelect: true,
  },
  roomIds: {
    label: t('meeting.meeting.meetingRoom'),
    type: String,
    col: 6,
    optionsDropdown: mtRooms,
    isMultiSelect: true,
  },
});
</script>

<style lang='scss' scoped>
:deep(.p-button-group .p-button:first-of-type:not(:only-of-type)) {
  border-radius: 4px 0 0 4px;
}

:deep(.p-button-group .p-button:last-of-type:not(:only-of-type)) {
  border-radius: 0 4px 4px 0;
}

.view-button {
  display: flex;

  :deep(.p-button) {
    padding: 0.3rem 0.75rem !important;
  }
}

:deep(.p-selectbutton .p-button:focus) {
  box-shadow: none !important;
  outline: none !important;
}

:deep(.p-multiselect-label) {
  max-height: 38px;
}

</style>