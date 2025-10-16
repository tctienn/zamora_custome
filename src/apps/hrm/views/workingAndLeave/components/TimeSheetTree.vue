<template>
  <div class='p-1'>
    <div
      v-for='yearItem in sortedFilteredGroupedTimesheet'
      :key='yearItem.year'
      class='border-round mb-1'>
      <div
        class='align-items-center cursor-pointer flex hover:surface-200 p-1'
        @click='toggleYear(yearItem.year)'>
        <div class='align-items-center flex font-bold'>
          {{ yearItem.year }}
          <i
            :class="['pi ml-2', expandedYears.includes(yearItem.year) ? 'pi-chevron-down' : 'pi-chevron-right']"
            style='font-size: 0.8rem;'></i>
        </div>
      </div>
      <div
        v-show='expandedYears.includes(yearItem.year)'
        class='ml-2'>
        <div
          v-for='monthItem in yearItem.months'
          :key='yearItem.year + "-" + monthItem.month'
          class='ml-2'>
          <div
            class='align-items-center cursor-pointer flex hover:surface-200 p-1'
            @click='toggleMonth(`${yearItem.year}-${monthItem.month}`)'>
            <div class='align-items-center flex'>
              {{t('common.month')}} {{ monthItem.month }}
              <i
                :class="['pi ml-2', expandedMonths.includes(`${yearItem.year}-${monthItem.month}`) ? 'pi-chevron-down' : 'pi-chevron-right']"
                style='font-size: 0.8rem;'></i>
            </div>
          </div>
          <div
            v-show='expandedMonths.includes(`${yearItem.year}-${monthItem.month}`)'
            class='ml-2'>
            <div
              v-for='timesheet in monthItem.timesheets'
              :key='timesheet.id'
              class='border-round-sm cursor-pointer mb-1 p-2 timesheet-item w-full'
              :class='{ "timesheet-selected": isSelected(timesheet?.id || "") }'
              @click='selectTimeSheet(timesheet)'>
              <div class='flex w-full'>
                <AppAvatar
                  :avatar='getCreatorName(timesheet.createdUserId)?.avatar2'
                  class='mr-2'
                  :label='getCreatorName(timesheet.createdUserId)?.name'
                  shape='circle'
                  size='2.5'
                  @mouseenter='(e: MouseEvent) => {
                    const user = getCreatorName(timesheet.createdUserId);
                    if (user) showUserOverlay(e, user);
                  }'/>
                <div class='align-items-center flex justify-content-between w-11'>
                  <div>
                    <div class='font-bold'>{{ timesheet.name }}</div>

                    <div class='text-500 text-xs'>
                      {{ formatDateTime(timesheet.createdDate?.toString() || "") }}
                    </div>
                  </div>
                  <div
                    class='border-1 border-dashed border-round p-1 text-sm'
                    :class='getStatusClass(timesheet.status || "")'>
                    {{ getStatusText(timesheet.status || '') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <UserOverlay
      ref='userOverlayRef'
      :user='userOverlay.user'/>
  </div>
</template>

<script lang='ts' setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserMoreInfo } from '@/apps/admin/model/User';

type CreatorInfo = UserMoreInfo & { name: string; avatar2: string };
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { groupTimesheetsByYearAndMonth } from '@/apps/hrm/helpers/utils';
import type { TimeSheetDataItem, TimeSheetGroupByMonth } from '@/apps/hrm/model/time-sheet';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import UserOverlay from '@/common/components/custom/UserOverlay.vue';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';

// Define interfaces for grouped timesheet data structure
interface GroupedTimesheetMonth {
  month: number;
  timesheets: TimeSheetDataItem[];
}

interface GroupedTimesheetYear {
  year: number;
  months: GroupedTimesheetMonth[];
}

// Define the props for the component
interface Props {
  timeSheetData: TimeSheetDataItem[];
}

const props = withDefaults(defineProps<Props>(), { timeSheetData: () => [], });

const emit = defineEmits<Emits>();

// Define emits for events
interface Emits {
  (e: 'select-createdUserId', createdUserId: any): void;
  (e: 'select-time-sheet', timeSheet: TimeSheetDataItem): void;
  (e: 'refetch'): void;
}

const sortedFilteredGroupedTimesheet = computed<TimeSheetGroupByMonth>(() => {
  return groupTimesheetsByYearAndMonth(props.timeSheetData);
});
const { t } = useI18n();

// Local state for expanded years and months in this tab panel
const expandedYears = ref<number[]>([]);
const expandedMonths = ref<string[]>([]);
const selectedTimeSheetId = ref<string | null>(null);
const hasAutoSelected = ref(false);
const userOverlayRef = ref();
const userOverlay = ref<{
  visible: boolean;
  user?: UserMoreInfo;
  event?: Event;
}>({ visible: false });
// Function to handle year expansion toggle
const toggleYear = (year: number) => {
  const index = expandedYears.value.indexOf(year);
  if (index > -1) {
    expandedYears.value.splice(index, 1);
    // Also collapse all months in this year
    expandedMonths.value = expandedMonths.value.filter(monthKey => !monthKey.startsWith(`${year}-`));
  } else {
    expandedYears.value.push(year);
  }
};

// Function to handle month expansion toggle
const toggleMonth = (monthKey: string) => {
  const index = expandedMonths.value.indexOf(monthKey);
  if (index > -1) {
    expandedMonths.value.splice(index, 1);
  } else {
    expandedMonths.value.push(monthKey);
  }
};

// Initialize userMoreInfo store
const userMoreInfoStore = useUserMoreInfoStore();

// Function to handle timesheet selection - emits the timesheet ID when clicked
const selectTimeSheet = (timeSheet: TimeSheetDataItem) => {
  selectedTimeSheetId.value = timeSheet.id || null;
  emit('select-time-sheet', timeSheet);
};

// Function to check if a timesheet is selected
const isSelected = (id: string) => {
  return selectedTimeSheetId.value === id;
};

// Auto-select first timesheet of current month after data is loaded
const selectFirstCurrentMonthTimesheet = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
  
  for (const yearItem of sortedFilteredGroupedTimesheet.value) {
    if (yearItem.year === currentYear) {
      for (const monthItem of yearItem.months) {
        if (monthItem.month === currentMonth && monthItem.timesheets.length > 0) {
          // Expand the current year and month
          if (!expandedYears.value.includes(currentYear)) {
            expandedYears.value.push(currentYear);
          }
          const monthKey = `${currentYear}-${currentMonth}`;
          if (!expandedMonths.value.includes(monthKey)) {
            expandedMonths.value.push(monthKey);
          }
          
          // Select the first timesheet of the current month
          const firstTimesheet = monthItem.timesheets[0];
          selectTimeSheet(firstTimesheet);
          return;
        }
      }
    }
  }
};

// Auto-select first timesheet of current month when data is loaded (only once)
watchEffect(() => {
  if (sortedFilteredGroupedTimesheet.value && sortedFilteredGroupedTimesheet.value.length > 0 && !hasAutoSelected.value) {
    selectFirstCurrentMonthTimesheet();
    hasAutoSelected.value = true;
  }
});

// Get CSS class for status
function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
  case 'DRAFT':
    return 'bg-gray-100 text-gray-800 border-gray-300 border-round-sm';
  case 'PENDING':
    return 'bg-blue-300 text-white border-blue-300 border-round-sm';
  case 'APPROVED':
    return 'bg-green-600 text-white border-green-700 border-round-sm';
  case 'REJECTED':
    return 'bg-red-500 text-white border-red-600 border-round-sm';
  default:
    return 'bg-gray-100 text-gray-800 border-gray-300 border-round-sm';
  }
}

// Get display text for status
function getStatusText(status: string) {
  switch (status?.toUpperCase()) {
  case 'DRAFT':
    return 'Dự thảo';
  case 'PENDING':
    return 'Chờ  tổng hợp';
  case 'APPROVED':
    return 'Đã chốt';
  case 'REJECTED':
    return 'Đã từ chối';
  default:
    return status;
  }
}

// Get full name of creator
function getCreatorName(userId: string): CreatorInfo | null {
  if (!userId) {
    return null;
  }
  const user = userMoreInfoStore.usersMoreInfo[userId];
  if (!user) {
    return null;
  }
  return {
    ...user,
    name: user.fullName || user.username || '',
    avatar2: generateAvatarUrl(user.avatar as string | '') || '',
  };
}

// Format date time to show only day/month/year
function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

watch(() => props.timeSheetData, (newVal) => {
  if (newVal && newVal.length > 0 && !hasAutoSelected.value) {
    selectFirstCurrentMonthTimesheet();
    hasAutoSelected.value = true;
  }
}, { immediate: true });

function showUserOverlay(event: Event, item: UserMoreInfo) {
  EventBus.emit('user-overlay', {
    visible: true,
    user: item,
    event: event
  });
}

function toggleUserOverlay(data: {
  visible: boolean;
  user?: UserMoreInfo;
  event?: Event;
}) {
  nextTick(() => {
    userOverlay.value = data;
  }).then(() => {
    userOverlayRef.value.show(data.event);
  });
}

onMounted(() => {
  EventBus.on('user-overlay', toggleUserOverlay);
});

onBeforeUnmount(() => {
  EventBus.off('user-overlay', toggleUserOverlay);
});

defineExpose({
  selectTimeSheet,
  selectFirstCurrentMonthTimesheet 
});

</script>

<style scoped>
.timesheet-item:hover {
  background-color: #EBF3FC !important;
}

.timesheet-selected {
  background-color: #EBF3FC !important;
}
.timesheet-item {
  margin-left: -1rem;
}
</style>