<template>
  <Toolbar class='align-content-center mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('meeting.meeting.title') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='align-items-center btn-group-toolbar flex flex-warp gap-1 h-3rem mr-1'>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("meeting.meeting.bookingMeeting")'
          @click='openForm()'>
        </Button>
        <Button
          v-if='activeStatus === 0'
          class='focus:shadow-none font-normal hover:surface-200'
          :disabled='meetings.length === 0'
          icon='pi pi-send'
          label='Chuyển xử lý'
          severity='secondary'
          @click='handleStartFlow'></Button>
        <Button
          v-else-if='activeStatus === 1'
          class='focus:shadow-none font-normal hover:surface-200'
          :disabled='meetings.length === 0'
          icon='pi pi-send'
          label='Phê duyệt'
          severity='secondary'
          @click='handleStartFlow'></Button>
      </div>
    </template>
  </Toolbar>
  <div class='flex flex-column gap-2 h-full'>
    <MeetingTopDisplayPanel
      v-model:createdByIds='createdByIds'
      v-model:display='display'
      v-model:filterMeetingStatus='filterMeetingStatus'
      v-model:month='month'
      v-model:statuses='statuses'
      v-model:week='week'
      v-model:year='year'
      class='border-1 border-300 border-round-sm p-1 surface-0'
      :select-created-by-ids='activeStatus === 2'/>
    <div>
      <TabView
        v-model:activeIndex='activeStatus'>
        <TabPanel
          v-for='(tab, index) in tabMenus'
          :key='index'
          class='hover:surface-hover'>
          <template #header>
            <div
              class='align-items-center flex gap-2'
              @click='activeStatus = index'>
              <span class='line-height-3 white-space-nowrap'>{{ tab.label }}</span>
              <Badge
                v-if='tab.count > 0'
                :style='`background-color: ${tab.color}`'
                :value='tab.count'/>
            </div>
          </template>
        </TabPanel>
      </TabView>

      <MeetingGrid
        ref='meetingGrid'
        :list-date-prop='dateBetween'
        :list-meeting-prop='filterListMeeting'
        @delete-success='deleteSuccess'
        @selected-rows='getMeetingData'
        @update-success='deleteSuccess'/>
    </div>

    <Sidebar
      v-model:visible='visibleForm'
      :dismissable='false'
      v-bind='DEFAULT_DIALOG_CONFIG'
      :header='`${idMeeting ? t("meeting.common.update") : t("meeting.common.create")} ${lowerCase(t(`meeting.common.meeting`))}`'
      :modal='true'
      position='right'
      :pt="{
        header: {
          class: 'border-bottom-1 border-300',
        },
      }"
      :show-close-icon='false'
      @hide='() => {
        idMeeting = undefined
        visibleForm = false
      }'>
      <template #header>
        <div class='align-items-center flex justify-content-between w-full'>
          <div class='align-items-center flex gap-2 p-sidebar-header-content'>
            <Button
              class='border-round-sm px-0'
              icon='pi pi-arrow-left'
              severity='danger'
              style='width: 30px; height: 30px;'
              @click='hideForm'/>
            {{ idMeeting ? t('meeting.common.update') : t('meeting.common.create') }}
            {{ lowerCase(t(`meeting.common.meeting`)) }}
          </div>

        </div>
      </template>
      <MeetingForm
        :id='idMeeting'
        @hide-dialog='hideDialog'>
      </MeetingForm>
    </Sidebar>
  </div>

  <StartFlowForm
    v-if='showStartFlowForm'
    :id='meetings[0]?.id || undefined'
    :flow-id='meetings[0]?.flowId || undefined'
    :visible-dialog='showStartFlowForm'
    @hide-dialog='hideStartFlowForm'/>

  <StartFlowsDialog
    v-if='showStartFlowsDialog'
    :meetings='meetings'
    :type='activeStatus === 0 ? StatusMeetingEnum.DRAFT : StatusMeetingEnum.PENDING'
    :visible-dialog='showStartFlowsDialog'
    @hide-dialog='hideStartFlowsDialog'/>
</template>

<script lang='ts' setup>

import { clone, lowerCase } from 'lodash';
import type { MenuItem } from 'primevue/menuitem';
import { inject, onMounted, provide, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { countMeeting, listMeetingByStartEnd } from '@/apps/meeting/graphql/meeting';
import { type MeetingInterface, MeetingStatus, StatusMeetingEnum } from '@/apps/meeting/model/meeting';
import StartFlowForm from '@/apps/meeting/views/meeting/components/flow/StartFlowForm.vue';
import StartFlowsDialog from '@/apps/meeting/views/meeting/components/flow/StartFlowsDialog.vue';
import {
  currentWeekNumber,
  getDatesInMonth,
  getDatesInWeek
} from '@/apps/meeting/views/meeting/components/meeting-calendar';
import MeetingForm from '@/apps/meeting/views/meeting/components/MeetingForm.vue';
import MeetingTopDisplayPanel from '@/apps/meeting/views/meeting/components/MeetingTopDisplayPanel.vue';
import MeetingGrid from '@/apps/meeting/views/meeting/MeetingGrid.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n() || {};
const { moment } = useMoment();
const visibleForm = ref(false);
const idMeeting = ref();
const display = ref<'week' | 'month'>('week');
const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());
const week = ref(currentWeekNumber());
const startDate = ref<Date>();
const endDate = ref<Date>();
const dateBetween = ref<Date[]>([]);
const listMeeting = ref();
const userIds = ref<string[]>([]);
const createdByIds = ref<string[]>([]);
const statuses = ref<StatusMeetingEnum[]>(Object.values(StatusMeetingEnum).map(status => status));
const filterListMeeting = ref();
const filterMeetingStatus = ref(MeetingStatus.ALL);
const activeStatus = ref(0);
const searchTerm = inject('searchTerm', ref(''));
const showStartFlowForm = ref(false);
const showStartFlowsDialog = ref(false);
const meetingGrid = ref<any>(null);

const {
  refetch: getRefetch,
  variables: getVariable,
  onResult: getResult
} = listMeetingByStartEnd();

provide('openForm', openForm);

const refreshMeeting = ref(false);
provide('refreshMeeting', refreshMeeting);

watch(refreshMeeting, (newValue) => {
  if (newValue) {
    refetchAll();
    refreshMeeting.value = false;
  }
});

const refetchAll = () => {
  getRefetch();
  countMeetingRefetch();
  meetings.value = [];
  meetingGrid.value.resetSelectedRows();
};

onMounted(() => {
  setFromAndToDate(display.value);
});

watch(filterMeetingStatus, () => {
  applyFilter();
});

watch(
  [searchTerm, display, year, month, week, userIds, statuses, activeStatus, createdByIds],
  () => {
    setFromAndToDate(display.value);
  },
  { deep: true }
);

getResult((res) => {
  listMeeting.value = res.data.listMeetingByStartEnd;
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
      isConfig: true,
      statuses: statuses.value,
      approval: activeStatus.value === 1,
      isMine: activeStatus.value === 0,
      createdByIds: activeStatus.value === 2 ? createdByIds.value : null
    }
  };
  countMeetingVariable.value = {
    searchModel: {
      keyword: searchTerm.value,
      userIds: userIds.value,
      startDate: moment(startDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
      endDate: moment(endDate.value).format(DateTimeFormat.ISO_LOCAL_DATE),
      isConfig: true,
      statuses: statuses.value,
      approval: activeStatus.value === 1,
      isMine: activeStatus.value === 0,
      createdByIds: activeStatus.value === 2 ? createdByIds.value : null
    }
  };
}

function openForm(id?: string | undefined) {
  idMeeting.value = id;
  visibleForm.value = true;
}

function hideDialog() {
  visibleForm.value = false;
  refetchAll();
}

function deleteSuccess() {
  refetchAll();
}

function setFromAndToDate(display: string) {
  const dates = display === 'week' ? getDatesInWeek(year.value, week.value) : getDatesInMonth(year.value, month.value);

  dateBetween.value = clone(dates);
  startDate.value = dates.shift();
  endDate.value = dates.pop();

  getMeeting();
}

const hideStartFlowForm = () => {
  showStartFlowForm.value = false;
  refetchAll();
};

const hideStartFlowsDialog = () => {
  showStartFlowsDialog.value = false;
  refetchAll();
};

const hideForm = () => {
  visibleForm.value = false;
  idMeeting.value = undefined;
};

const meetings = ref<MeetingInterface[]>([]);
const getMeetingData = (data: MeetingInterface[]) => {
  meetings.value = data;
};

const handleStartFlow = () => {
  if (meetings.value.length === 1 && meetings.value[0].flowId) {
    showStartFlowForm.value = true;
  }
  if (meetings.value.length > 1) {
    showStartFlowsDialog.value = true;
  }
};

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

const {
  refetch: countMeetingRefetch,
  onResult: countMeetingResult,
  variables: countMeetingVariable
} = countMeeting();

countMeetingResult((res) => {
  const dataCountMeeting = res.data.countMeeting || {};
  tabMenus.value.forEach((tab) => {
    tab.count = dataCountMeeting[tab.code] || 0;
  });
});

const tabMenus = ref<
  MenuItem & { code: string; label: string; count: number; color: string }[]
>([
  {
    code: 'mine',
    label: t('meeting.meeting.mine'),
    count: 0,
    color: '',
  },
  {
    code: 'approval',
    label: t('meeting.meeting.approval'),
    count: 0,
    color: '#FF8B4E',
  },
  {
    code: 'all',
    label: t('meeting.meeting.all'),
    count: 0,
    color: '',
  },
]);

</script>

<script lang='ts'>

</script>

<style scoped>

:deep(.p-multiselect-label) {
  max-height: 38px;
}

:deep(.p-tabview-nav-link) {
  padding: 0.5rem 1rem;
}

:deep(.p-tabview-panels) {
  display: none;
}

:deep(.layout-content) {
  overflow: hidden !important;
}
</style>