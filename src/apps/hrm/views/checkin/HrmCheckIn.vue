<template>
  <div class='flex flex-column gap-2 w-full'>
    <div
      class='align-items-center border border-1 border-300 border-round-lg flex justify-content-between px-2 tool-bar w-full'>
      <div class='font-semibold ml-2'>{{ t('hrm.camera.checkin.monitorTable') }}</div>
      <div class='flex gap-2'>
        <Calendar
          v-model='selectedDate'
          date-format='DD, dd/mm/yy'
          icon-display='input'
          :max-date='today'
          :min-date='moment(today).subtract(30, "day").toDate()'
          show-button-bar
          show-icon/>
        <TreeSelect
          v-model='selectedOrganization'
          class='custom-select'
          :options='tree'
          selection-mode='single'/>
      </div>
    </div>
    <div class='flex justify-content-between'>
      <HrmCheckinTotal
        :checked-in='checkedInEmployees'
        :guests='guests'
        :total='totalEmployees'
        @choose-tab='getTabIndex'/>
      <Button
        v-if='defaultAttendanceType === AttendanceType.FINGER_PRINT'
        icon='pi pi-sync'
        :label='t("common.sync")'
        :loading='syncLoading'
        @click='syncFingerPrintData'></Button>
    </div>
    <div
      v-if='currentTab == 1 || currentTab == 2'
      class='overflow-auto'
      style='max-height: calc(100vh - 16rem)'>
      <Accordion
        v-model:active-index='activeTabs'
        multiple>
        <AccordionTab
          v-for='(tab, index) in tabs'
          :key='tab.key'>
          <template #header>
            <div class='flex justify-content-between pr-4 w-full'>
              <div class='font-semibold text-lg'>{{ index + 1 }}. {{ tab.label }}</div>
              <div
                v-if='tab.key'
                class='font-semibold text-lg'>
                {{
                  mapOrgEmployees[tab.key]?.filter((c: EmployeeSummaryWithCheckin) => c.checkins?.[currentDateKey]?.firstCheckin)?.length || 0
                }}/
                {{ mapOrgEmployees[tab.key]?.length || 0 }}
              </div>
            </div>

          </template>
          <CheckInPersonsDisplay
            :employees='tab.key ? mapOrgEmployees[tab.key]: []'
            :selected-date='selectedDate'
            @view-detail='viewDetail'/>
        </AccordionTab>
      </Accordion>
    </div>

    <div
      v-if='currentTab == 3'
      style='max-height: calc(100vh - 15.5rem)'>
      <HrmGuest :selected-date='selectedDate'/>
    </div>

    <HrmCheckinDetailSidebar
      v-model:visible='detailVisible'
      :employee-id='detailEmployeeId'
      :employee-name='selectedEmployeeName'
      :selected-date='selectedDate'/>
  </div>

</template>

<script lang='ts' setup>
import { clone } from 'lodash';
import type { TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { checkInAndOutByDate, countGuestByDate } from '@/apps/hrm/api/graphql/checkin';
import { getDefaultAttendanceType } from '@/apps/hrm/api/graphql/default_attendance';
import { searchEmployeesMinimal } from '@/apps/hrm/api/graphql/employee';
import { syncFingerData } from '@/apps/hrm/api/graphql/finger';
import { convertToOrganizationTreeNodes } from '@/apps/hrm/helpers/utils';
import { AttendanceType } from '@/apps/hrm/model/attendance';
import { type CheckinAndOut, transformCheckInCounts } from '@/apps/hrm/model/checkin';
import {
  type EmployeeFilter,
  EmployeeSnapshotStatus,
  type EmployeeSummaryWithCheckin,
  EmployeeWorkingStatus
} from '@/apps/hrm/model/employee';
import { useCheckinSSE } from '@/apps/hrm/views/checkin/checkin-sse';
import CheckInPersonsDisplay from '@/apps/hrm/views/checkin/CheckInPersonsDisplay.vue';
import HrmCheckinDetailSidebar from '@/apps/hrm/views/checkin/HrmCheckinDetailSidebar.vue';
import HrmCheckinTotal from '@/apps/hrm/views/checkin/HrmCheckinTotal.vue';
import HrmGuest from '@/apps/hrm/views/checkin/HrmGuest.vue';
import { HRM_URL } from '@/common/api/configService';
import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Connection } from '@/common/model/page';
import type { Pageable } from '@/common/model/query';

const { t } = useI18n();
const { moment } = useMoment();
const today = new Date();
const sse = useCheckinSSE();
const tree = ref<TreeNode[]>([]);
const selectedOrganization = ref<TreeSelectionKeys>();
const selectedDate = ref<Date>(today);
const mapOrgEmployees = reactive<Record<string, EmployeeSummaryWithCheckin[]>>({});
const checkInCounts = reactive<Record<string, CheckinAndOut[]>>({});
const detailVisible = ref(false);
const detailEmployeeId = ref('');
const currentTab = ref(1);
const selectedEmployeeName = ref();
const totalEmployees = computed(() => {
  let total = 0;
  for (const key in mapOrgEmployees) {
    total += mapOrgEmployees[key].length;
  }
  return total;
});

const checkedInEmployees = computed(() => {
  let total = 0;
  for (const key in mapOrgEmployees) {
    const employees = mapOrgEmployees[key];
    total += employees.filter(e => e.checkins?.[currentDateKey.value]
      ?.firstCheckin).length;
  }
  return total;
});

const guests = ref(0);

getAllOrganizationPublicGraphql().onResult((res) => {
  tree.value = convertToOrganizationTreeNodes(res.data?.allOrganizationPublic || []);
  if (tree.value[0]?.key) {
    selectedOrganization.value = { [tree.value[0]?.key]: true };
  }
});

const { result: defaultAttendanceResult } = getDefaultAttendanceType();
const defaultAttendanceType = computed(() => defaultAttendanceResult.value?.defaultAttendanceType as AttendanceType || AttendanceType.CAMERA);
const syncLoading = ref(false);

function syncFingerPrintData() {
  syncLoading.value = true;
  syncFingerData().mutate()
    .finally(() => {
      syncLoading.value = false;
    });
}

watch(selectedDate, (value) => {
  if (!value) {
    selectedDate.value = today;
  }
  findCheckInAndOut(value);
  countGuest(value);
});

const tabs = computed(() => {
  if (!selectedOrganization.value) {
    return [];
  }
  const firstKey = Object.keys(selectedOrganization.value)[0];
  const selected = findNodeByKey(firstKey, tree.value);
  if (selected) {
    return selected.children;
  }
  return [];
});
const activeTabs = ref<number[]>([]);
watch(tabs, (value) => {
  if (value?.length) {
    activeTabs.value = value.map((_, index) => index);
  }
});

watch(tabs, value => {
  value?.forEach((item) => {
    if (item.key && !mapOrgEmployees[item.key]) {
      findEmployeesInOrganization(item.key);
    }
  });
});

watch(checkInCounts, value => {
  const transform = transformCheckInCounts(value || []);
  for (const key in mapOrgEmployees) {
    const employees = mapOrgEmployees[key];
    employees.forEach((employee) => {
      if (employee.id) {
        employee.checkins = transform[employee.id]?.checkins;
      }
    });
  }
});

function todayKey() {
  return `${moment(today).format(DateTimeFormat.ISO_LOCAL_DATE)}`;
}

function getTabIndex(index: number) {
  currentTab.value = index;
}

const currentDateKey = computed(() => {
  return `${moment(selectedDate.value).format(DateTimeFormat.ISO_LOCAL_DATE)}`;
});

function findEmployeesInOrganization(organizationId: string) {
  const pageable: Pageable = {
    page: 0,
    size: 1000,
  };
  const filter: EmployeeFilter = {
    organization: organizationId,
    workingStatus: EmployeeWorkingStatus.WORKING,
    snapshotStatus: EmployeeSnapshotStatus.ACTIVE,
  };
  searchEmployeesMinimal(filter, pageable).onResult((res) => {
    const transform = transformCheckInCounts(checkInCounts || []);
    mapOrgEmployees[organizationId] = (res.data?.searchEmployees as Connection<EmployeeSummaryWithCheckin>)?.edges.map(e => {
      const node = clone(e.node);
      if (node.id) {
        node.checkins = transform[node.id]?.checkins;
      }
      return node;
    }) || [];
  });
}

function findNodeByKey(key: string, tree: TreeNode[]): TreeNode | null {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findNodeByKey(key, node.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function findCheckInAndOut(date: Date) {
  const key = `${moment(date).format(DateTimeFormat.ISO_LOCAL_DATE)}`;
  if (!checkInCounts[key]) {
    checkInAndOutByDate(key).onResult((res) => {
      const data = res.data?.checkInAndOutByDate as CheckinAndOut[] || [];
      Object.assign(checkInCounts, { [key]: data });
    });
  }
}

function countGuest(date: Date) {
  countGuestByDate(moment(date).format(DateTimeFormat.ISO_LOCAL_DATE))
    .onResult((res) => {
      guests.value = res.data?.countGuestByDate as number || 0;
    });
}

function viewDetail(data: any) {
  detailEmployeeId.value = data.id;
  selectedEmployeeName.value = data.fullName;
  detailVisible.value = true;
}

onMounted(() => {
  sse.register(`${HRM_URL}/sse/checkin/all`, {
    'all-checkin': (e) => {
      const data = JSON.parse(e['data']) as CheckinAndOut[] || [];
      Object.assign(checkInCounts, { [todayKey()]: data });
    },
    'update-checkin': (e) => {
      const data = JSON.parse(e['data']) as CheckinAndOut || {};
      if (!data.personId) {
        countGuest(selectedDate.value);
        return;
      }
      if (checkInCounts[todayKey()]?.find(c => c.personId === data.personId)) {
        checkInCounts[todayKey()] = checkInCounts[todayKey()].map((item) => {
          if (item.personId === data.personId) {
            return data;
          }
          return item;
        });
      } else {
        Object.assign(checkInCounts, { [todayKey()]: [data] });
      }
    }
  });
  countGuest(today);
});

onUnmounted(() => {
  sse.disconnect();
});
</script>

<style scoped>
.tool-bar {
  background-color: var(--surface-overlay);
  min-height: 3rem;
}

:deep(.p-calendar .p-inputtext) {
  padding: 0.5rem;
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}

:deep(.custom-select) {
  max-height: 36px;
  margin-top: auto;
  margin-bottom: auto;
}

:deep(.p-treeselect-label) {
  padding: 0.5rem;
  max-height: 36px;
}

:deep(.p-accordion-header-link) {
  padding: 7px;
}
</style>